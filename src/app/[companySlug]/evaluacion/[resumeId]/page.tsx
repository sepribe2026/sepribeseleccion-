'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Shield, ArrowRight } from 'lucide-react'

export default function EvaluationPage() {
  const params = useParams()
  const companySlug = params.companySlug as string
  const resumeId = params.resumeId as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [candidate, setCandidate] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  
  // Respuestas: key es el ID de la pregunta, value es el objeto { text, score, disc_axis, etc }
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    if (resumeId) {
      loadEvaluationData()
    }
  }, [resumeId])

  const loadEvaluationData = async () => {
    try {
      // 1. Obtener candidato
      const { data: resumeData, error: resumeError } = await supabase
        .from('email_resumes')
        .select('*')
        .eq('id', resumeId)
        .maybeSingle()
      
      if (resumeError) throw resumeError
      if (!resumeData) throw new Error('Candidato no encontrado.')
      
      setCandidate(resumeData)

      // 2. Obtener config del cargo
      const { data: jobData, error: jobError } = await supabase
        .from('job_positions')
        .select('test_config')
        .eq('cargo', resumeData.position)
        .maybeSingle()

      if (jobError) throw jobError

      const config = jobData?.test_config || {}
      
      if (!config.etica && !config.disc) {
        // No requiere pruebas
        setIsSuccess(true)
        setLoading(false)
        return
      }

      // 3. Obtener preguntas aleatorias
      let typesToFetch = []
      if (config.etica) typesToFetch.push('ETICA')
      if (config.disc) typesToFetch.push('DISC')

      const { data: questionsData, error: qError } = await supabase
        .from('evaluation_questions')
        .select('*')
        .in('test_type', typesToFetch)
        .eq('is_active', true)
      
      if (qError) throw qError

      if (questionsData && questionsData.length > 0) {
        // Mezclar aleatoriamente en el cliente
        const shuffled = [...questionsData].sort(() => 0.5 - Math.random())
        
        // Tomar hasta 20 preguntas (o el máximo disponible) para no abrumar
        setQuestions(shuffled.slice(0, 20))
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al cargar las evaluaciones.')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (questionId: string, option: any) => {
    setResponses(prev => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async () => {
    if (Object.keys(responses).length < questions.length) {
      setError('Por favor, responde a todas las preguntas antes de continuar.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Calcular score básico (suma de score para ETICA, desglose para DISC)
      let eticaScore = 0
      let discTally: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 }

      const responseDetails = questions.map(q => {
        const answer = responses[q.id]
        if (q.test_type === 'ETICA') {
          eticaScore += (answer.score || 0)
        } else if (q.test_type === 'DISC' && answer.disc_axis) {
          discTally[answer.disc_axis] += 1
        }
        return {
          question_id: q.id,
          test_type: q.test_type,
          question: q.question_text,
          answer: answer.text,
          score: answer.score,
          disc_axis: answer.disc_axis
        }
      })

      const finalScore = {
        etica: eticaScore,
        disc: discTally
      }

      // Insertar en candidate_evaluations
      const { error: insertError } = await supabase.from('candidate_evaluations').insert([{
        resume_id: resumeId,
        test_type: 'MIXED', // ya que combinamos las pruebas en una sola sesión
        score: finalScore,
        responses: responseDetails
      }])

      if (insertError) throw insertError

      setIsSuccess(true)
    } catch (err: any) {
      setError('Ocurrió un error al guardar tus resultados. Intenta nuevamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontWeight: 'bold' }}>Cargando evaluación...</p>
      </div>
    )
  }

  if (isSuccess || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(23, 23, 23, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '550px', width: '100%' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={48} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: '0 0 16px' }}>¡Evaluación Completada!</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>
            Gracias por completar las pruebas psicométricas. Hemos anexado los resultados a tu postulación.
          </p>
          <button 
            onClick={() => router.push(`/${companySlug}/postular`)}
            style={{ 
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
              color: '#111111', 
              border: 'none',
              padding: '16px 32px', 
              borderRadius: '12px', 
              fontWeight: '900', 
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(251, 191, 36, 0.08)', padding: '12px', borderRadius: '50%', marginBottom: '16px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <Shield size={36} color="#fbbf24" />
          </div>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Evaluación Psicométrica</h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Candidato: <strong>{candidate?.sender_name}</strong></p>
        </div>

        <div style={{ background: 'rgba(23, 23, 23, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '14px' }}>
              <AlertCircle size={20} color="#fca5a5" />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {questions.map((q, index) => {
              const selectedOpt = responses[q.id]
              return (
                <div key={q.id} style={{ background: 'rgba(17, 17, 17, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <h3 style={{ margin: '0 0 20px', color: 'white', fontSize: '16px', fontWeight: '600', lineHeight: '1.5' }}>
                    <span style={{ color: '#fbbf24', marginRight: '8px' }}>{index + 1}.</span> {q.question_text}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {q.options && q.options.map((opt: any, optIndex: number) => {
                      const isSelected = selectedOpt && selectedOpt.text === opt.text
                      return (
                        <label 
                          key={optIndex} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '16px', 
                            borderRadius: '12px', 
                            background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(17, 17, 17, 0.6)', 
                            border: `1px solid ${isSelected ? '#fbbf24' : 'rgba(255,255,255,0.05)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`question_${q.id}`} 
                            checked={isSelected}
                            onChange={() => handleOptionSelect(q.id, opt)}
                            style={{ width: '18px', height: '18px', accentColor: '#fbbf24' }}
                          />
                          <span style={{ color: isSelected ? '#fef9c3' : '#cbd5e1', fontSize: '14px' }}>{opt.text}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
                color: '#111111', 
                border: 'none',
                padding: '16px 32px', 
                borderRadius: '12px', 
                fontWeight: '900', 
                fontSize: '15px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'GUARDANDO...' : 'FINALIZAR EVALUACIÓN'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
