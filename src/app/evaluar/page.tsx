'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, User, RefreshCw, Star, MessageSquare, AlertCircle, LogOut } from 'lucide-react'

interface PredefinedOption {
  id: string
  label: string
  weight: number
  category: string
}

interface ActiveCandidate {
  id: string
  resume_id: string
  candidate_name: string
  candidate_cargo: string
  city?: string
  age?: number | string
  gender?: string
  education?: string
  ai_summary?: string
}

export default function SupervisorPortal() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [supervisor, setSupervisor] = useState<{ id: string; name: string; email: string; created_by_user?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // Real-time states
  const [activeCandidate, setActiveCandidate] = useState<ActiveCandidate | null>(null)
  const [pendingCandidates, setPendingCandidates] = useState<any[]>([])
  const [options, setOptions] = useState<PredefinedOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false)
  const [evaluationSubmitted, setEvaluationSubmitted] = useState(false)
  const [checkingActive, setCheckingActive] = useState(true)
  const [assigned, setAssigned] = useState<boolean>(true) // default true to avoid flicker

  // 1. Cargar opciones predefinidas de la base
  const fetchOptions = async () => {
    const { data, error } = await supabase
      .from('formative_options')
      .select('*')
      .order('category', { ascending: true })
    if (!error && data) {
      setOptions(data)
    }
  }

  // 2. Cargar sesión guardada en localStorage
  useEffect(() => {
    const savedSupervisor = localStorage.getItem('supervisor_session')
    if (savedSupervisor) {
      try {
        const parsed = JSON.parse(savedSupervisor)
        setSupervisor(parsed)
        fetchOptions()
      } catch (e) {
        localStorage.removeItem('supervisor_session')
      }
    }
    setCheckingActive(false)
  }, [])

  // 3. Inicio de sesión / Verificación con Windows AD
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor ingrese usuario y contraseña.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      // 1. Autenticar con Active Directory a través de la API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: username.trim(),
          password: password,
          app: 'supervisor'
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenciales de Windows inválidas')
      }

      // 2. Buscar si el usuario autenticado está registrado como supervisor
      const cleanUser = username.trim().toLowerCase()
      const shortUser = cleanUser.split('@')[0]

      const { data: supData, error: supError } = await supabase
        .from('formative_supervisors')
        .select('*')
        .or(`email.ilike."${cleanUser}",email.ilike."${shortUser}@%"`)
        .maybeSingle()

      if (supError || !supData) {
        setErrorMessage(`Autenticación de Windows exitosa para "${cleanUser}", pero no está registrado como supervisor en el panel formativo. Pida al reclutador que lo registre.`)
        setSupervisor(null)
      } else {
        setSupervisor(supData)
        localStorage.setItem('supervisor_session', JSON.stringify(supData))
        fetchOptions()
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error de conexión con el servidor de autenticación.')
      setSupervisor(null)
    } finally {
      setLoading(false)
    }
  }

  // 4. Salir / LogOut
  const handleLogout = () => {
    localStorage.removeItem('supervisor_session')
    setSupervisor(null)
    setActiveCandidate(null)
    setEvaluationSubmitted(false)
  }

  // 5. Escuchar cambios de candidato activo
  useEffect(() => {
    if (!supervisor) return

    // Consulta inicial del candidato activo
    const checkActiveCandidate = async () => {
      try {
        let candidateId = null

        if (supervisor.created_by_user) {
          const { data: recActive } = await supabase
            .from('recruiter_active_candidate')
            .select('active_candidate_id')
            .eq('recruiter_user', supervisor.created_by_user)
            .maybeSingle()
          if (recActive && recActive.active_candidate_id) {
            candidateId = recActive.active_candidate_id
          }
        }

        if (!candidateId) {
          const { data: latestActiveList } = await supabase
            .from('recruiter_active_candidate')
            .select('active_candidate_id')
            .order('updated_at', { ascending: false })
            .limit(1)
          if (latestActiveList && latestActiveList[0] && latestActiveList[0].active_candidate_id) {
            candidateId = latestActiveList[0].active_candidate_id
          }
        }

        // Cargar cola de TODOS los candidatos formativos (todos los reclutadores de la empresa)
        const { data: allCands } = await supabase
          .from('formative_candidates')
          .select(`
            id,
            resume_id,
            email_resumes (
              sender_name,
              position
            )
          `)
          .order('created_at', { ascending: true })

        if (allCands) {
          const { data: myEvals } = await supabase
            .from('formative_evaluations')
            .select('candidate_id')
            .eq('supervisor_id', supervisor.id)

          const evaluatedIds = new Set(myEvals?.map(e => e.candidate_id) || [])
          
          const queue = allCands.map((c: any) => ({
            id: c.id,
            name: c.email_resumes?.sender_name || 'Candidato',
            position: c.email_resumes?.position || 'Cargo',
            isEvaluated: evaluatedIds.has(c.id)
          }))
          setPendingCandidates(queue)
        }

        if (!candidateId) {
          setActiveCandidate(null)
          setEvaluationSubmitted(false)
          return
        }

        // Obtener detalles del candidato formativo y su hoja de vida asociada
        const { data: candidate, error: candidateError } = await supabase
          .from('formative_candidates')
          .select(`
            id,
            resume_id,
            email_resumes (
              sender_name,
              position,
              city,
              age,
              gender,
              education_level,
              education_title,
              education_institution,
              ai_summary
            )
          `)
          .eq('id', candidateId)
          .single()

        if (candidateError || !candidate) {
          setActiveCandidate(null)
          return
        }

        setAssigned(true)

        // Verificar si ya se envió evaluación para este candidato por este supervisor
        const { data: evaluation } = await supabase
          .from('formative_evaluations')
          .select('id')
          .eq('candidate_id', candidateId)
          .eq('supervisor_id', supervisor.id)
          .single()

        if (evaluation) {
          setEvaluationSubmitted(true)
        } else {
          setEvaluationSubmitted(false)
        }

        const resumeData = (candidate as any).email_resumes
        let eduStr = ''
        if (resumeData?.education_level) {
          eduStr += resumeData.education_level
          if (resumeData.education_title) eduStr += ` (${resumeData.education_title})`
          if (resumeData.education_institution) eduStr += ` en ${resumeData.education_institution}`
        }

        setActiveCandidate({
          id: candidateId,
          resume_id: candidate.resume_id,
          candidate_name: resumeData?.sender_name || 'Candidato',
          candidate_cargo: resumeData?.position || 'Cargo',
          city: resumeData?.city || 'No especificada',
          age: resumeData?.age || 'No especificada',
          gender: resumeData?.gender || 'No especificado',
          education: eduStr || 'No especificados',
          ai_summary: resumeData?.ai_summary || ''
        })
      } catch (err) {
        console.error('Error checking active candidate:', err)
      }
    }

    checkActiveCandidate()

    // Configurar polling cada 3 segundos para actualización en vivo sencilla y garantizada
    const interval = setInterval(checkActiveCandidate, 3000)
    return () => clearInterval(interval)
  }, [supervisor])

  // 6. Manejar la selección/deselección de opciones
  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  // 7. Enviar la evaluación
  const handleSubmitEvaluation = async () => {
    if (!supervisor || !activeCandidate) return
    if (selectedOptions.length === 0) {
      alert('Por favor selecciona al menos un comentario/evaluación.')
      return
    }

    setSubmittingEvaluation(true)
    try {
      // Calcular puntaje total sumando los pesos de las opciones seleccionadas
      const selectedOptsDetails = options.filter(opt => selectedOptions.includes(opt.id))
      const totalScore = selectedOptsDetails.reduce((sum, opt) => sum + opt.weight, 0)

      const { error } = await supabase
        .from('formative_evaluations')
        .upsert({
          candidate_id: activeCandidate.id,
          supervisor_id: supervisor.id,
          score: totalScore,
          selected_options: selectedOptions
        }, { onConflict: 'candidate_id,supervisor_id' })

      if (error) throw error

      setEvaluationSubmitted(true)
      setSelectedOptions([])
    } catch (e: any) {
      alert('Error al guardar la evaluación: ' + e.message)
    } finally {
      setSubmittingEvaluation(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* HEADER BAR */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star style={{ color: '#3b82f6', fill: '#3b82f6' }} size={24} />
          <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evaluaciones Formativas</h1>
        </div>
        {supervisor && (
          <button 
            onClick={handleLogout} 
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <LogOut size={13} />
            Salir
          </button>
        )}
      </div>

      {checkingActive ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px' }}>
          <RefreshCw className="animate-spin" style={{ color: '#3b82f6' }} size={32} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Iniciando...</p>
        </div>
      ) : !supervisor ? (
        
        /* PANTALLA DE INGRESO */
        <div style={{ width: '100%', maxWidth: '480px', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>Acceso Supervisor</h2>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Inicia sesión con tu usuario y contraseña de Windows.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Usuario de Windows</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ej: jsoto"
                style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
              />
            </div>

            {errorMessage && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle style={{ color: '#ef4444', flexShrink: 0 }} size={16} />
                <p style={{ margin: 0, fontSize: '12.5px', color: '#fca5a5', lineHeight: 1.4 }}>{errorMessage}</p>
              </div>
            )}

            <button 
              onClick={handleLogin}
              disabled={loading || !username.trim() || !password.trim()}
              style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', opacity: (loading || !username.trim() || !password.trim()) ? 0.6 : 1, transition: 'all 0.2s' }}
            >
              {loading ? 'Iniciando Sesión...' : 'Ingresar'}
            </button>
          </div>
        </div>

      ) : (

        /* PANTALLA PRINCIPAL DE EVALUACIÓN */
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* PERFIL SUPERVISOR */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <User size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Supervisor Activo</p>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{supervisor.name}</h3>
            </div>
          </div>

          {/* ESTADO DE CANDIDATO EN EVALUACIÓN */}
          {!activeCandidate ? (
            
            /* ESPERANDO CANDIDATO */
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              <div className="animate-pulse" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw style={{ color: '#3b82f6' }} size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Esperando Candidato</h3>
              <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
                El reclutador principal aún no ha iniciado la evaluación de un candidato. La pantalla se actualizará automáticamente cuando empiece.
              </p>
            </div>

          ) : !assigned ? (

            /* NO ASIGNADO A ESTE CANDIDATO */
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              <AlertCircle style={{ color: '#eab308' }} size={48} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Sin Asignación</h3>
              <p style={{ color: '#eab308', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{activeCandidate.candidate_name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                No tienes asignada la evaluación de este candidato. Por favor, solicita al reclutador que te asigne en su panel si consideras que es un error.
              </p>
            </div>

          ) : evaluationSubmitted ? (
            
            /* EVALUACIÓN ENVIADA - ESPERANDO SIGUIENTE */
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              <CheckCircle2 style={{ color: '#10b981' }} size={48} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>¡Evaluación Enviada!</h3>
              <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{activeCandidate.candidate_name}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                Tu calificación para este candidato ha sido guardada. Esperando a que el reclutador inicie la evaluación del siguiente postulante...
              </p>
            </div>

          ) : (

            /* FORMULARIO DE EVALUACIÓN */
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              
              {/* FICHA CANDIDATO */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', padding: '18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Evaluando Candidato</span>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px', color: '#f8fafc' }}>{activeCandidate.candidate_name}</h2>
                  <p style={{ color: '#60a5fa', fontSize: '13.5px', fontWeight: 600, margin: 0 }}>{activeCandidate.candidate_cargo}</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ciudad</span>
                    <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{activeCandidate.city}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Edad / Género</span>
                    <span style={{ color: '#cbd5e1', fontWeight: '500' }}>
                      {activeCandidate.age ? `${activeCandidate.age} años` : '—'} / {activeCandidate.gender || '—'}
                    </span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Estudios</span>
                    <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{activeCandidate.education}</span>
                  </div>
                </div>

                {activeCandidate.ai_summary && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Resumen de Perfil (IA)</span>
                    <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0, lineHeight: 1.4, fontStyle: 'italic' }}>"{activeCandidate.ai_summary}"</p>
                  </div>
                )}
              </div>

              {/* OPCIONES DE EVALUACIÓN POR CATEGORÍA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Criterios de Evaluación</span>
                
                {options.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Cargando criterios configurados...</p>
                ) : (
                  options.map(opt => {
                    const isSelected = selectedOptions.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleOption(opt.id)}
                        style={{
                          textAlign: 'left',
                          width: '100%',
                          background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                          border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)',
                          background: isSelected ? '#3b82f6' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSelected && <CheckCircle2 size={12} style={{ color: 'white' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '13.5px', color: isSelected ? '#f8fafc' : '#cbd5e1', fontWeight: isSelected ? '700' : '500', lineHeight: 1.4 }}>
                            {opt.label}
                          </p>
                          <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'inline-block' }}>
                            Categoría: {opt.category}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {/* BOTÓN DE ENVIAR */}
              <button 
                onClick={handleSubmitEvaluation}
                disabled={submittingEvaluation || selectedOptions.length === 0}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                  opacity: (submittingEvaluation || selectedOptions.length === 0) ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {submittingEvaluation ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <MessageSquare size={16} />
                    Enviar Calificación
                  </>
                )}
              </button>

            </div>
          )}

          {/* COLA DE CANDIDATOS / ESTADO DE PROGRESO */}
          {supervisor && pendingCandidates.length > 0 && (
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cola de Candidatos ({pendingCandidates.filter(c => !c.isEvaluated).length} Pendientes)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingCandidates.map((c, idx) => {
                  const isActive = activeCandidate?.id === c.id;
                  return (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.3)', border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: isActive ? '#f8fafc' : '#cbd5e1', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {idx + 1}. {c.name}
                        </span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.position}</span>
                      </div>
                      
                      {isActive ? (
                        <span style={{ fontSize: '10px', background: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', flexShrink: 0 }}>
                          Evaluando Ahora
                        </span>
                      ) : c.isEvaluated ? (
                        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', flexShrink: 0 }}>
                          ✅ Evaluado
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', flexShrink: 0 }}>
                          ⏳ Pendiente
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
