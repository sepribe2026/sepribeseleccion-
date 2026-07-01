'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { UploadCloud, CheckCircle2, AlertCircle, Briefcase, MapPin, User, Mail, Clock, ChevronDown, Shield, FileText } from 'lucide-react'
import { useParams } from 'next/navigation'

// Genera el email de privacidad según la empresa
function getPrivacyEmail(slug: string): string {
  const map: Record<string, string> = {
    sepribe: 'privacidad@sepribe.com.ec',
    medeport:     'privacidad@medeport.com.ec',
    equinox:      'privacidad@equinox.com.ec',
  }
  return map[slug?.toLowerCase()] || `privacidad@${slug}.com.ec`
}

const CONSENT_TEXT = (companyName: string, privacyEmail: string) => `CONSENTIMIENTO INFORMADO PARA EL TRATAMIENTO DE DATOS PERSONALES DE POSTULANTES

Al registrar mis datos y cargar mi hoja de vida en la presente plataforma, declaro que he sido informado/a de forma clara, previa, expresa y suficiente sobre el tratamiento de mis datos personales por parte de ${companyName}, en calidad de Responsable del Tratamiento, conforme a la Ley Orgánica de Protección de Datos Personales y su Reglamento.

Autorizo de manera libre, específica, informada e inequívoca a ${companyName} para recopilar, registrar, almacenar, consultar, analizar, clasificar, conservar y tratar mis datos personales ingresados en la plataforma, así como aquellos contenidos en mi hoja de vida, con la finalidad de gestionar mi postulación, evaluar mi perfil profesional, contactarme en relación con procesos de selección actuales o futuros, verificar la información proporcionada y determinar mi posible adecuación a una vacante.

Declaro conocer que, como parte del proceso de selección, ${companyName} podrá utilizar herramientas tecnológicas con funcionalidades de inteligencia artificial, cuyo objetivo será generar un resumen breve de mi perfil profesional, experiencia, formación, habilidades y posible compatibilidad con la vacante a la que aplico, con el fin de facilitar la revisión inicial por parte del área de Desarrollo Humano y Organizacional —DHO—.

El uso de inteligencia artificial tendrá carácter auxiliar y de apoyo, por lo que no sustituirá necesariamente la revisión humana ni implicará por sí solo una decisión definitiva de contratación, descarte o vinculación laboral. La decisión final dentro del proceso de selección corresponderá al área competente de ${companyName}.

Los datos personales tratados podrán incluir: nombres y apellidos, número de identificación, datos de contacto, domicilio o ciudad de residencia, formación académica, experiencia laboral, referencias, competencias, aspiración salarial, disponibilidad, información contenida en la hoja de vida y demás datos que el postulante proporcione voluntariamente en la plataforma.

En caso de que mi hoja de vida contenga datos sensibles o categorías especiales de datos personales, declaro que los proporciono voluntariamente y autorizo su tratamiento únicamente en la medida en que sean estrictamente necesarios para la gestión de mi postulación. No obstante, se recomienda no incluir información sensible que no sea necesaria para el proceso de selección.

Mis datos serán conservados durante el tiempo necesario para gestionar la postulación y, posteriormente, podrán mantenerse en la base de talento de ${companyName} para futuras vacantes, por un plazo máximo de 12 meses, salvo que solicite previamente su eliminación o revoque mi consentimiento.

Declaro conocer que puedo ejercer en cualquier momento mis derechos de acceso, rectificación, actualización, eliminación, oposición, anulación, limitación del tratamiento, portabilidad y derecho a no ser objeto de una decisión basada únicamente en valoraciones automatizadas, escribiendo al correo: ${privacyEmail}. También podré revocar mi consentimiento en cualquier momento, sin que ello afecte la licitud del tratamiento realizado con anterioridad a dicha revocatoria.

Asimismo, declaro conocer que la negativa a proporcionar mis datos personales o a aceptar este consentimiento impedirá continuar con el registro de mi postulación en la plataforma, al ser información necesaria para gestionar el proceso de selección.`;

export default function ApplyPage() {
  const params = useParams()
  const companySlug = params.companySlug as string
  
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [courseFile, setCourseFile] = useState<File | null>(null)
  const [recordFile, setRecordFile] = useState<File | null>(null)
  const [driverFile, setDriverFile] = useState<File | null>(null)
  const [insertedId, setInsertedId] = useState('')
  const [jobPositions, setJobPositions] = useState<any[]>([])
  const [companyInfo, setCompanyInfo] = useState({ name: 'SEPRIBE CIA.LTDA.', slug: 'sepribe' })
  const [postulationEnabled, setPostulationEnabled] = useState(true)
  const [checkingSettings, setCheckingSettings] = useState(true)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    celular: '',
    cargo: '',
    ciudad: '',
    experiencia: '',
    edad: '',
    logro: '',
    herramientas: '',
    consentimiento: false,
    noAceptoConsentimiento: false,
    birth_date: '',
    civil_status: '',
    home_address: '',
    sector: '',
    education_level: '',
    education_institution: '',
    education_title: '',
    heard_from: '',
    likes_sports: '',
    sports_practiced: '',
    work_culture_motivation: '',
    genero: '',
    military_experience: '',
    guard_course: '',
    estatura: '',
    rotating_shifts: '',
    driving_license: ''
  })

  useEffect(() => {
    if (companySlug) {
      fetchCompanyInfo()
      fetchJobPositions()
    }
  }, [companySlug])

  useEffect(() => {
    if (companyInfo.name && companyInfo.name !== 'SEPRIBE CIA.LTDA.') {
      document.title = `Unete a ${companyInfo.name} | Talento Humano`
    }
  }, [companyInfo.name])

  const fetchCompanyInfo = async () => {
    setCheckingSettings(true)
    // Intentar obtener el nombre de la empresa desde los perfiles
    const { data } = await supabase
      .from('admin_profiles')
      .select('company_name')
      .eq('company_slug', companySlug)
      .limit(1)
      .maybeSingle()
    
    if (data) {
      setCompanyInfo({ name: data.company_name, slug: companySlug })
    } else {
      // Fallback simple si no hay perfil creado aún para ese slug
      const name = companySlug.toLowerCase() === 'sepribe' ? 'SEPRIBE CIA.LTDA.' : (companySlug.charAt(0).toUpperCase() + companySlug.slice(1) + ' S.A.')
      setCompanyInfo({ name, slug: companySlug })
    }

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('company_settings')
        .select('postulation_enabled')
        .eq('company_slug', companySlug)
        .maybeSingle()
      if (settingsError) throw settingsError
      if (settings) {
        setPostulationEnabled(settings.postulation_enabled)
      } else {
        setPostulationEnabled(true)
      }
    } catch (e) {
      console.error('Error fetching company postulation settings:', e)
      setPostulationEnabled(true) // fallback
    } finally {
      setCheckingSettings(false)
    }
  }

  const fetchJobPositions = async () => {
    const { data } = await supabase
      .from('job_positions')
      .select('*')
      .eq('company_slug', companySlug)
      .order('cargo', { ascending: true })
    if (data) {
      const seen = new Set<string>()
      const unique = data.filter(p => {
        const key = p.cargo.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setJobPositions(unique)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name === 'consentimiento' && val) {
      setFormData(prev => ({ ...prev, consentimiento: true, noAceptoConsentimiento: false }))
    } else if (name === 'noAceptoConsentimiento' && val) {
      setFormData(prev => ({ ...prev, consentimiento: false, noAceptoConsentimiento: true }))
    } else if (name === 'birth_date') {
      const birthDate = new Date(value);
      let calculatedAge = '';
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        calculatedAge = age >= 0 ? age.toString() : '';
      }
      setFormData(prev => ({ 
        ...prev, 
        birth_date: value,
        edad: calculatedAge
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: val }))
    }
  }

  const handleJobSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const job = jobPositions.find(j => j.id === selectedId);
    if (job) {
      setFormData(prev => ({ ...prev, cargo: job.cargo, city: job.ciudad || prev.ciudad, ciudad: job.ciudad || prev.ciudad }));
    } else {
      setFormData(prev => ({ ...prev, cargo: '', city: '', ciudad: '' }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Por favor, adjunta tu hoja de vida en PDF.'); return }
    if (!formData.consentimiento) { setError('Debes aceptar el tratamiento de datos personales para postularte.'); return }
    if (formData.cedula.length < 10) { setError('La cédula debe tener al menos 10 dígitos.'); return }
    if (parseInt(formData.experiencia) > 15) { setError('Los años de experiencia no pueden superar los 15 años.'); return }
    if (parseInt(formData.edad) < 18) { setError('Debes tener al menos 18 años para postularte.'); return }
    if (!formData.ciudad) { setError('Por favor, selecciona tu ciudad.'); return }
    if (!formData.genero) { setError('Por favor, selecciona tu género.'); return }
    
    setLoading(true)
    setError('')

    try {
      // 1. Verificar si ya existe la cédula
      const { data: existing, error: checkError } = await supabase
        .from('email_resumes')
        .select('id')
        .eq('cedula', formData.cedula)
        .limit(1)

      if (checkError) throw checkError
      if (existing && existing.length > 0) {
        setError('Ya te has postulado anteriormente con este número de cédula. ¡Gracias por tu interés!')
        setLoading(false)
        return
      }

      // 2. Subir archivos a Storage
      const emailUid = `WEB${Date.now()}`
      
      const uploadDocument = async (fileObj: File, prefix: string) => {
        const fileExt = fileObj.name.split('.').pop()
        const sanitizedName = fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storageFileName = `${prefix}_${emailUid}_${sanitizedName}`
        
        const { error: uploadError } = await supabase.storage
          .from('candidate-documents')
          .upload(storageFileName, fileObj, { upsert: true })
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('candidate-documents')
          .getPublicUrl(storageFileName)
          
        return publicUrl
      }

      // Subida de CV obligatoria
      const publicUrl = await uploadDocument(file, 'resume')

      // Subidas adicionales condicionales u opcionales
      let coursePdfUrl = null
      if (courseFile) {
        coursePdfUrl = await uploadDocument(courseFile, 'course_cert')
      }

      let recordPdfUrl = null
      if (recordFile) {
        recordPdfUrl = await uploadDocument(recordFile, 'record_cert')
      }

      let driverPdfUrl = null
      if (driverFile) {
        driverPdfUrl = await uploadDocument(driverFile, 'driver_cert')
      }

      // 3. Insertar en email_resumes
      const { data: insertedData, error: dbError } = await supabase.from('email_resumes').insert([{
        email_uid: emailUid,
        sender_email: formData.email,
        sender_name: formData.nombre,
        cedula: formData.cedula,
        subject: `Postulación Web: ${formData.cargo}`,
        received_date: new Date().toISOString(),
        file_name: file.name,
        pdf_url: publicUrl,
        sender_phone: formData.celular,
        classification_status: 'PENDING',
        position: formData.cargo,
        city: formData.ciudad,
        experience_years: formData.experiencia,
        age: formData.edad,
        skills: `${formData.herramientas}${formData.guard_course === 'Sí' ? ', Curso de Guardia 120H' : ''}${formData.military_experience === 'Sí' ? ', Experiencia Militar/Policial' : ''}${formData.driving_license && formData.driving_license !== 'No posee' ? `, Licencia ${formData.driving_license}` : ''}`,
        main_achievement: formData.logro,
        key_tools: formData.herramientas,
        ai_summary: `CED: ${formData.cedula} | TEL: ${formData.celular} | ESTATURA: ${formData.estatura} cm | CURSO 120H: ${formData.guard_course} | EXP MILITAR/POLICIAL: ${formData.military_experience} | TURNOS ROTATIVOS: ${formData.rotating_shifts} | LICENCIA: ${formData.driving_license} | LOGRO: ${formData.logro} | HERRAMIENTAS: ${formData.herramientas} | CONSENTIMIENTO LOPDP: ACEPTADO`,
        company_slug: companySlug,
        birth_date: formData.birth_date || null,
        civil_status: formData.civil_status || null,
        home_address: formData.home_address || null,
        sector: formData.sector || null,
        education_level: formData.education_level || null,
        education_institution: formData.education_institution || null,
        education_title: formData.education_title || null,
        heard_from: formData.heard_from || null,
        gender: formData.genero || null,
        likes_sports: formData.likes_sports || null,
        sports_practiced: formData.sports_practiced || null,
        work_culture_motivation: formData.work_culture_motivation || null,
        
        // Campos específicos de reclutamiento de seguridad
        military_experience: formData.military_experience || null,
        guard_course: formData.guard_course || null,
        estatura: formData.estatura ? parseInt(formData.estatura) : null,
        rotating_shifts: formData.rotating_shifts || null,
        driving_license: formData.driving_license || null,
        course_pdf_url: coursePdfUrl,
        record_pdf_url: recordPdfUrl,
        driver_pdf_url: driverPdfUrl
      }]).select('id').single()

      if (dbError) throw dbError

      if (insertedData) {
        setInsertedId(insertedData.id)
      }

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al enviar la postulación')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSettings) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Clock size={48} color="#fbbf24" className="animate-spin" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Cargando portal...</p>
        </div>
      </div>
    )
  }

  if (!postulationEnabled) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Clock size={44} color="#fbbf24" />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: '0 0 16px', lineHeight: '1.2' }}>Recepción Pausada</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
            En este momento, la recepción de nuevas solicitudes de postulación para <strong>{companyInfo.name}</strong> no está activa.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.05)', margin: '0 0 12px' }}>
            Pronto habilitaremos el portal para recibir más candidatos. ¡Muchas gracias por tu interés en formar parte de nuestro equipo!
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '550px', width: '100%' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={48} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: '0 0 16px' }}>¡Postulación Recibida!</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Gracias <strong>{formData.nombre}</strong>, hemos registrado tu postulación de forma exitosa.
          </p>
          
          <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.15)', padding: '20px', borderRadius: '16px', marginBottom: '32px', textAlign: 'left' }}>
            <h4 style={{ color: '#fbbf24', fontSize: '15px', fontWeight: '800', margin: '0 0 8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} /> Paso Obligatorio Siguiente
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
              Como empresa de seguridad privada, requerimos que todos nuestros aspirantes completen una evaluación de aptitudes psicológicas y de comportamiento. Puedes iniciar la evaluación ahora mismo haciendo clic en el botón de abajo.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <a 
              href={`/evaluacion/${insertedId}`}
              style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
                color: '#0f172a', 
                padding: '16px 32px', 
                borderRadius: '12px', 
                fontWeight: '900', 
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              INICIAR EVALUACIÓN PSICOMÉTRICA
            </a>
            
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                background: 'transparent', 
                color: '#94a3b8', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                padding: '12px 24px', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '13px',
                cursor: 'pointer', 
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
            >
              Volver al inicio / Enviar otra
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0b0f19 0%, #020617 100%)', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(251, 191, 36, 0.08)', padding: '12px', borderRadius: '50%', marginBottom: '16px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <Shield size={36} color="#fbbf24" />
          </div>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Portal de Postulación</h1>
          <p style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '700', letterSpacing: '0.05em' }}>{companyInfo.name} | Reclutamiento de Seguridad</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(30, 41, 59, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '14px' }}>
              <AlertCircle size={20} color="#fca5a5" />
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '32px' }}>
            
            {/* Sección 1: Información Personal */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#fbbf24" /> Datos Personales
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Nombre Completo *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input type="text" name="nombre" required placeholder="Ej: JUAN PÉREZ" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Número de Cédula *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input type="text" name="cedula" required placeholder="10 dígitos" maxLength={10} value={formData.cedula} onChange={handleChange} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Correo Electrónico *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input type="email" name="email" required placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Celular / WhatsApp *</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input type="text" name="celular" required placeholder="Ej: 0987654321" value={formData.celular} onChange={handleChange} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Fecha de Nacimiento *</label>
                    <div style={{ position: 'relative' }}>
                      <input type="date" name="birth_date" required value={formData.birth_date} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Edad</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input type="number" name="edad" readOnly placeholder="Auto" value={formData.edad} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', outline: 'none', backgroundColor: 'rgba(15, 23, 42, 0.4)', color: '#94a3b8', cursor: 'not-allowed' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Estado Civil *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="civil_status"
                        required 
                        value={formData.civil_status}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Soltero/a">Soltero/a</option>
                        <option value="Casado/a">Casado/a</option>
                        <option value="Unión Libre legalizada">Unión Libre legalizada</option>
                        <option value="Divorciado/a">Divorciado/a</option>
                        <option value="Viudo/a">Viudo/a</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Género *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="genero"
                        required 
                        value={formData.genero}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Dirección y Residencia */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#fbbf24" /> Ubicación y Residencia
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Ciudad de Residencia *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="ciudad"
                        required 
                        value={formData.ciudad}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, ciudad: val, sector: '' }));
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Quito">Quito</option>
                        <option value="Guayaquil">Guayaquil</option>
                        <option value="Cuenca">Cuenca</option>
                        <option value="Manta">Manta</option>
                        <option value="Portoviejo">Portoviejo</option>
                        <option value="Machala">Machala</option>
                        <option value="Loja">Loja</option>
                        <option value="Ambato">Ambato</option>
                        <option value="Santo Domingo">Santo Domingo</option>
                        <option value="Ibarra">Ibarra</option>
                        <option value="Otra">Otra / Provincia</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Sector *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="sector"
                        required 
                        value={formData.sector}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Norte">Norte</option>
                        <option value="Centro">Centro</option>
                        <option value="Sur">Sur</option>
                        {formData.ciudad === 'Quito' && (
                          <>
                            <option value="Cumbayá">Cumbayá</option>
                            <option value="Valle de los Chillos">Valle de los Chillos</option>
                          </>
                        )}
                        {formData.ciudad === 'Guayaquil' && (
                          <>
                            <option value="Samborondón">Samborondón</option>
                            <option value="Vía a la Costa">Vía a la Costa</option>
                          </>
                        )}
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Dirección Domiciliaria Completa *</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" name="home_address" required placeholder="Calle principal, numeración de casa y calle transversal" value={formData.home_address} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Perfil y Experiencia */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="#fbbf24" /> Perfil y Cargo
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Seleccionar Cargo al que Postula *</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 1 }} />
                    <select 
                      required 
                      onChange={handleJobSelect} 
                      style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                    >
                      <option value="">Seleccionar...</option>
                      {jobPositions.map(job => (
                        <option key={job.id} value={job.id}>
                          {job.cargo} {job.ciudad ? '· ' + job.ciudad : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Años de Experiencia en Seguridad *</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input type="number" name="experiencia" required min="0" max="15" placeholder="Ej: 2" value={formData.experiencia} onChange={handleChange} style={{ width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Habilidades / Competencias Clave *</label>
                    <input 
                      type="text" 
                      name="herramientas" 
                      required 
                      placeholder="Ej: Defensa personal, primeros auxilios, CCTV" 
                      value={formData.herramientas} 
                      onChange={handleChange} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Logro relevante o experiencia destacada *</label>
                  <textarea 
                    name="logro" 
                    required 
                    placeholder="Ej: Encargado de supervisión de seguridad nocturna en centro comercial o control de accesos de alta afluencia" 
                    value={formData.logro} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN NUEVA: REQUISITOS ESPECÍFICOS DE SEGURIDAD */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(251, 191, 36, 0.15)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#fbbf24" /> Requisitos y Perfil de Seguridad
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>¿Curso de Guardia 120 Horas? *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="guard_course"
                        required 
                        value={formData.guard_course}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Sí">Sí, aprobado y registrado</option>
                        <option value="No">No, no poseo el curso</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>¿Servicio Militar o Policial? *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="military_experience"
                        required 
                        value={formData.military_experience}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Sí">Sí, licenciado/a de FFAA/Policía</option>
                        <option value="No">No poseo experiencia militar/policial</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Estatura en Centímetros *</label>
                    <input 
                      type="number" 
                      name="estatura" 
                      required 
                      min="100"
                      max="250"
                      placeholder="Ej: 175" 
                      value={formData.estatura} 
                      onChange={handleChange} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Licencia de Conducir *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="driving_license"
                        required 
                        value={formData.driving_license}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="No posee">No poseo licencia</option>
                        <option value="Tipo B">Sí, Tipo B (Liviana)</option>
                        <option value="Tipo C">Sí, Tipo C (Profesional)</option>
                        <option value="Tipo D/E">Sí, Tipo D o E (Pesada)</option>
                        <option value="Tipo A">Sí, Tipo A (Motocicletas)</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>¿Disponibilidad para Turnos Rotativos 24/7? *</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      name="rotating_shifts"
                      required 
                      value={formData.rotating_shifts}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Sí">Sí, total disponibilidad para horarios rotativos</option>
                      <option value="No">No, tengo restricciones de horario</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 5: Educación y Estudios */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎓 Nivel de Estudios
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Nivel de Instrucción *</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      name="education_level"
                      required 
                      value={formData.education_level}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="Instrucción técnica completa">Instrucción técnica completa</option>
                      <option value="Instrucción técnica incompleta">Instrucción técnica incompleta</option>
                      <option value="Universidad Completa">Universidad Completa</option>
                      <option value="Universidad Incompleta">Universidad Incompleta</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Institución Educativa *</label>
                    <input type="text" name="education_institution" required placeholder="Nombre de la institución" value={formData.education_institution} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Título Obtenido</label>
                    <input type="text" name="education_title" placeholder="Ej: Bachiller en Ciencias, Técnico, etc" value={formData.education_title} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 6: Información Adicional */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📋 Información de Contexto
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>¿Realizas actividad física? *</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="likes_sports"
                        required 
                        value={formData.likes_sports}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            likes_sports: val,
                            sports_practiced: val === 'No' ? 'Ninguno' : prev.sports_practiced === 'Ninguno' ? '' : prev.sports_practiced
                          }));
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Si">Sí</option>
                        <option value="No">No</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>Deportes / Ejercicios que prácticas *</label>
                    <input 
                      type="text" 
                      name="sports_practiced" 
                      required={formData.likes_sports === 'Si'} 
                      disabled={formData.likes_sports === 'No'} 
                      placeholder={formData.likes_sports === 'No' ? 'No aplica' : 'Ej: Gimnasio, correr, fútbol'} 
                      value={formData.sports_practiced} 
                      onChange={handleChange} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: formData.likes_sports === 'No' ? 'rgba(255,255,255,0.05)' : '#090d16', color: formData.likes_sports === 'No' ? '#64748b' : 'white', fontSize: '14px', outline: 'none' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>¿Por qué medio te enteraste de la oferta? *</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      name="heard_from"
                      required 
                      value={formData.heard_from}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Referidos">Referidos</option>
                      <option value="Otros">Otros</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', marginLeft: '4px' }}>¿Qué te motiva de pertenecer a una empresa de seguridad como {companyInfo.name}? *</label>
                  <textarea 
                    name="work_culture_motivation" 
                    required 
                    placeholder="Describe brevemente tus expectativas, principios y motivación" 
                    value={formData.work_culture_motivation} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#090d16', color: 'white', fontSize: '14px', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                  />
                </div>
              </div>
            </div>

            {/* Sección 7: Documentación */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={18} color="#fbbf24" /> Adjuntar Documentación
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* 1. CV Obligatorio */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Cargar Hoja de Vida (Formato PDF) *</label>
                  <div 
                    onClick={() => document.getElementById('cv-upload')?.click()}
                    style={{ 
                      border: '2px dashed #334155', 
                      borderRadius: '12px', 
                      padding: '24px', 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      background: file ? 'rgba(34, 197, 94, 0.08)' : '#090d16',
                      borderColor: file ? '#22c55e' : '#334155',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <input type="file" id="cv-upload" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <UploadCloud size={32} color={file ? '#22c55e' : '#64748b'} style={{ marginBottom: '8px', margin: '0 auto 8px' }} />
                    {file ? (
                      <p style={{ margin: 0, fontWeight: '700', color: '#4ade80', fontSize: '14px' }}>{file.name}</p>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#cbd5e1', fontSize: '14px' }}>Haz clic para seleccionar tu archivo PDF</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Tamaño máximo: 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Certificado Antecedentes Penales - Recomendado */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Certificado de Antecedentes Penales (Formato PDF) (Recomendado)</label>
                  <div 
                    onClick={() => document.getElementById('record-upload')?.click()}
                    style={{ 
                      border: '2px dashed #334155', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      background: recordFile ? 'rgba(34, 197, 94, 0.08)' : '#090d16',
                      borderColor: recordFile ? '#22c55e' : '#334155',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <input type="file" id="record-upload" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setRecordFile(e.target.files?.[0] || null)} />
                    <UploadCloud size={28} color={recordFile ? '#22c55e' : '#64748b'} style={{ marginBottom: '8px', margin: '0 auto 8px' }} />
                    {recordFile ? (
                      <p style={{ margin: 0, fontWeight: '700', color: '#4ade80', fontSize: '14px' }}>{recordFile.name}</p>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#cbd5e1', fontSize: '13px' }}>Haz clic para seleccionar el PDF de antecedentes penales</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Certificado Curso de Guardia (120H) */}
                {formData.guard_course === 'Sí' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Certificado de Curso de Guardia 120 Horas (Formato PDF)</label>
                    <div 
                      onClick={() => document.getElementById('course-upload')?.click()}
                      style={{ 
                        border: '2px dashed #334155', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        background: courseFile ? 'rgba(34, 197, 94, 0.08)' : '#090d16',
                        borderColor: courseFile ? '#22c55e' : '#334155',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <input type="file" id="course-upload" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setCourseFile(e.target.files?.[0] || null)} />
                      <UploadCloud size={28} color={courseFile ? '#22c55e' : '#64748b'} style={{ marginBottom: '8px', margin: '0 auto 8px' }} />
                      {courseFile ? (
                        <p style={{ margin: 0, fontWeight: '700', color: '#4ade80', fontSize: '14px' }}>{courseFile.name}</p>
                      ) : (
                        <>
                          <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#cbd5e1', fontSize: '13px' }}>Haz clic para seleccionar el PDF del curso de guardia</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Copia de Licencia */}
                {formData.driving_license && formData.driving_license !== 'No posee' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Copia de Licencia de Conducir / Historial Antt (Formato PDF)</label>
                    <div 
                      onClick={() => document.getElementById('driver-upload')?.click()}
                      style={{ 
                        border: '2px dashed #334155', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        background: driverFile ? 'rgba(34, 197, 94, 0.08)' : '#090d16',
                        borderColor: driverFile ? '#22c55e' : '#334155',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <input type="file" id="driver-upload" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setDriverFile(e.target.files?.[0] || null)} />
                      <UploadCloud size={28} color={driverFile ? '#22c55e' : '#64748b'} style={{ marginBottom: '8px', margin: '0 auto 8px' }} />
                      {driverFile ? (
                        <p style={{ margin: 0, fontWeight: '700', color: '#4ade80', fontSize: '14px' }}>{driverFile.name}</p>
                      ) : (
                        <>
                          <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#cbd5e1', fontSize: '13px' }}>Haz clic para seleccionar el PDF de tu licencia / registro</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 8: Consentimiento de Datos LOPDP */}
            <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em', borderLeft: '4px solid #fbbf24', paddingLeft: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#fbbf24" /> Autorización de Datos LOPDP
              </h3>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px', padding: '12px', background: '#090d16', borderRadius: '8px', border: '1px solid #334155' }}>
                {CONSENT_TEXT(companyInfo.name, getPrivacyEmail(companySlug)).split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: para.includes(':') ? '8px' : '12px', fontWeight: para.startsWith('CONSENTIMIENTO') ? '800' : 'normal' }}>
                    {para}
                  </p>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: formData.consentimiento ? 'rgba(34, 197, 94, 0.08)' : 'transparent', border: `1px solid ${formData.consentimiento ? '#22c55e' : 'transparent'}`, transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    name="consentimiento" 
                    checked={formData.consentimiento} 
                    onChange={handleChange} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#fbbf24' }} 
                  />
                  <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
                    Acepto el tratamiento de mis datos personales para la gestión de mi postulación y el uso de herramientas auxiliares de selección.
                  </span>
                </label>

                <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: formData.noAceptoConsentimiento ? 'rgba(239, 68, 68, 0.08)' : 'transparent', border: `1px solid ${formData.noAceptoConsentimiento ? '#ef4444' : 'transparent'}`, transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    name="noAceptoConsentimiento" 
                    checked={formData.noAceptoConsentimiento} 
                    onChange={handleChange} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ef4444' }} 
                  />
                  <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
                    No acepto el tratamiento de mis datos personales.
                  </span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.consentimiento}
              style={{ 
                background: (loading || !formData.consentimiento) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
                color: (loading || !formData.consentimiento) ? '#64748b' : '#0f172a', 
                border: 'none', 
                padding: '16px', 
                borderRadius: '12px', 
                fontSize: '16px', 
                fontWeight: '900', 
                cursor: (loading || !formData.consentimiento) ? 'not-allowed' : 'pointer', 
                opacity: 1,
                marginTop: '12px',
                boxShadow: (loading || !formData.consentimiento) ? 'none' : '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'REGISTRANDO...' : 'ENVIAR MI POSTULACIÓN'}
            </button>

          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b', fontSize: '13px' }}>
          Al enviar este formulario, confirmas que la información proporcionada es verídica.
        </p>

      </div>
    </div>
  )
}
