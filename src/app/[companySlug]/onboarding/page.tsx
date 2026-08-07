'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UploadCloud, CheckCircle2, AlertCircle, Plus, Trash2, Check, FileCheck, Mail, User, Briefcase, MapPin, Eye, RefreshCw } from 'lucide-react'
import { useParams } from 'next/navigation'

const GET_WELCOME_TEXT = (companyName: string) => `A nombre de ${companyName} es un placer darte la bienvenida, esperamos que disfrutes con nosotros de nuestra actividad favorita, el deporte. Estamos orgullosos de ofrecer la mejor experiencia deportiva a nuestros consumidores a través de una asesoría del más alto nivel. Nos caracterizamos por ser un equipo que juega fuerte, que juega para ganar, sin excusas, siempre obedeciendo las reglas del juego. Estamos convencidos que tus competencias nos llevarán a lograr las metas que nos hemos propuesto. Eres parte de esta comunidad de apasionados por el deporte, dispuestos a transformar su entorno y contagiar esta pasión, volviéndose dueños del resultado y siempre trabajando hacia un mismo objetivo.`

const REQUIRED_DOCS = [
  "Hoja de vida actualizada",
  "Croquis de la direccion domiciliaria",
  "Planilla de servicios basicos",
  "Papeleta de votacion",
  "Carnet de guardia de primer nivel",
  "Licencia de conducir",
  "Certificado de cuenta Bancario",
  "Certificados de honorabilidad",
  "Copia a color del título académico",
  "Certificado de trabajos anteriores",
  "Diploma curso de primer nivel",
  "Diploma y copia de credencial curso de segundo nivel",
  "Diploma de reentrenamiento",
  "Certificados de otros cursos",
  "Copia del Carnet de tipo de sangre"
]

const TABS = [
  { id: 1, label: 'Bienvenida' },
  { id: 2, label: 'Personales' },
  { id: 3, label: 'Familiares' },
  { id: 4, label: 'Estudios' },
  { id: 5, label: 'Documentos' },
]

// Genera el email de privacidad segun la empresa
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

export default function OnboardingTabs() {
  const params = useParams()
  const companySlug = params.companySlug as string

  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [companyInfo, setCompanyInfo] = useState({ name: 'SEPRIBE CIA.LTDA.', slug: 'sepribe' })

  useEffect(() => {
    if (companySlug) {
      fetchCompanyInfo()
    }
  }, [companySlug])

  const fetchCompanyInfo = async () => {
    const { data } = await supabase
      .from('admin_profiles')
      .select('company_name')
      .eq('company_slug', companySlug)
      .limit(1)
      .maybeSingle()
    
    if (data) {
      setCompanyInfo({ name: data.company_name, slug: companySlug })
    } else {
      const name = companySlug.charAt(0).toUpperCase() + companySlug.slice(1) + ' S.A.'
      setCompanyInfo({ name, slug: companySlug })
    }
  }

  const [formData, setFormData] = useState({
    consentimiento: false, noAceptoConsentimiento: false, tratamiento: 'Sr.', nombres: '', apellido1: '', apellido2: '', ciudad_nacimiento: '', fecha_nacimiento: '', estado_civil: 'Soltera/o', nacionalidad: 'ECUADOR', cedula: '', banco_produbanco: '', tipo_cuenta: 'Cuenta de Ahorros', ciudad_residencia: '', direccion: '', telefono: '', celular: '', email: ''
  })
  const [conyuge, setConyuge] = useState({ tiene: false, nombres: '', apellidos: '', fecha_nacimiento: '', nacionalidad: 'Ecuador', ciudad_nacimiento: '', cedula: '' })
  const [hijos, setHijos] = useState<any[]>([])
  const [estudio, setEstudio] = useState({ nivel: 'Secundaria', titulo: '', institucion: '', fecha_inicio: '', fecha_fin: '' })

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'consentimiento' && checked) {
      setFormData(prev => ({ ...prev, consentimiento: true, noAceptoConsentimiento: false }))
    } else if (name === 'noAceptoConsentimiento' && checked) {
      setFormData(prev => ({ ...prev, consentimiento: false, noAceptoConsentimiento: true }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value.toUpperCase() }))
    }
  }

  const handleConyugeChange = (e: any) => {
    const { name, value } = e.target
    setConyuge(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleEstudioChange = (e: any) => {
    const { name, value } = e.target
    setEstudio(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const checkCedula = async (cedula: string) => {
    if (!cedula || cedula.length < 10) return
    const { data } = await supabase
      .from('onboarding_candidates')
      .select('cedula')
      .eq('cedula', cedula)
      .maybeSingle()
    
    if (data) {
      setError('Registro ya ingresado. Esta cédula ya existe en el sistema.')
    } else {
      if (error.includes('Registro ya ingresado')) setError('')
    }
  }

  const handleFileChange = (docName: string, file: File | null) => {
    if (!file) return;
    
    // 1. Validar que sea PDF
    if (file.type !== 'application/pdf') {
      setError(`El archivo para "${docName}" debe ser formato PDF.`);
      return;
    }

    // 2. Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`El archivo "${docName}" excede los 10MB.`);
      return;
    }
    
    setFiles(prev => ({ ...prev, [docName]: file }));
    setError('');
  }

  const getDynamicDocs = () => {
    let docs = [...REQUIRED_DOCS];

    // Si tiene cónyuge, agregar documentos de cónyuge
    if (conyuge.tiene) {
      docs.push("Copia a color de la cédula del conyugue");
      docs.push("Certificado de matrimonio actualizado o declaracion juramentada si es union libre");
    }

    // Manejo de hijos
    if (hijos.length > 0) {
      hijos.forEach((_, idx) => {
        docs.push(`Copia partida de nacimiento o copia de cédula de identidad - Hijo ${idx + 1}`);
      });
    }
    return docs;
  };

  const handleSubmit = async () => {
    const currentDocs = getDynamicDocs();
    
    // 1. Validar campos obligatorios de Personales y Bancarios
    const requiredFields = [
      { key: 'nombres', label: 'Nombres' },
      { key: 'apellido1', label: 'Primer Apellido' },
      { key: 'apellido2', label: 'Segundo Apellido' },
      { key: 'cedula', label: 'Cédula' },
      { key: 'ciudad_nacimiento', label: 'Ciudad de Nacimiento' },
      { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento' },
      { key: 'direccion', label: 'Dirección' },
      { key: 'ciudad_residencia', label: 'Ciudad de Residencia' },
      { key: 'celular', label: 'Celular' },
      { key: 'email', label: 'Correo Electrónico' },
      { key: 'banco_produbanco', label: 'Número de Cuenta Produbanco' }
    ];

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData]) {
        setActiveTab(2);
        setError(`El campo "${field.label}" es obligatorio en la sección de Datos Personales.`);
        return;
      }
    }

    if (!formData.consentimiento) { 
      setError('Debes aceptar el consentimiento de tratamiento de datos personales en la pestaña de Documentos.'); 
      return; 
    }
    
    // 2. Validar documentos específicos obligatorios
    const mandatoryDocs = ["Hoja de vida actualizada", "Diploma curso de primer nivel"];
    for (const doc of mandatoryDocs) {
      if (!files[doc]) {
        setActiveTab(5);
        setError(`El documento "${doc}" es obligatorio para poder enviar la ficha.`);
        return;
      }
    }

    setLoading(true)
    setError('')

    const getPrefix = (docName: string) => {
      if (docName.includes("Hijo")) {
        const num = docName.split(' ').pop();
        return `nacimiento_hijo_${num}`;
      }
      const map: Record<string, string> = {
        "Hoja de vida actualizada": "cv",
        "Croquis de la direccion domiciliaria": "croquis",
        "Planilla de servicios basicos": "servicios_basicos",
        "Papeleta de votacion": "papeleta_votacion",
        "Carnet de guardia de primer nivel": "carnet_primer_nivel",
        "Licencia de conducir": "licencia",
        "Certificado de cuenta Bancario": "cuenta_banco",
        "Certificado de matrimonio actualizado o declaracion juramentada si es union libre": "matrimonio",
        "Copia a color de la cédula del conyugue": "cedula_conyuge",
        "Certificados de honorabilidad": "honorabilidad",
        "Copia a color del título académico": "titulo",
        "Certificado de trabajos anteriores": "cert_trabajo",
        "Diploma curso de primer nivel": "diploma_primer_nivel",
        "Diploma y copia de credencial curso de segundo nivel": "diploma_segundo_nivel",
        "Diploma de reentrenamiento": "reentrenamiento",
        "Certificados de otros cursos": "otros_cursos",
        "Copia del Carnet de tipo de sangre": "tipo_sangre"
      };
      return map[docName] || "doc";
    };

    try {
      // Doble validación antes de guardar
      const { data: existing } = await supabase
        .from('onboarding_candidates')
        .select('cedula')
        .eq('cedula', formData.cedula)
        .maybeSingle()
        
      if (existing) {
        setActiveTab(2)
        setError('Registro ya ingresado. Esta cédula ya existe en el sistema.')
        setLoading(false)
        return
      }

      const documentosUrls: Record<string, string> = {};

      // Subir cada archivo que esté presente
      for (const docName of currentDocs) {
        const fileToUpload = files[docName];
        if (fileToUpload) {
          const fileExt = fileToUpload.name.split('.').pop();
          const prefix = getPrefix(docName);
          const timestamp = Date.now();
          const fileName = `${formData.cedula}/${formData.cedula}_${prefix}_${timestamp}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('candidate-documents')
            .upload(fileName, fileToUpload, { upsert: true });
          
          if (uploadError) throw new Error(`Error al subir ${docName}: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from('candidate-documents')
            .getPublicUrl(fileName);
          
          documentosUrls[docName] = publicUrl;
        }
      }

      const payload = {
        cedula: formData.cedula, 
        nombres: formData.nombres, 
        apellidos: `${formData.apellido1} ${formData.apellido2}`.trim(),
        email: formData.email.toLowerCase(), 
        telefono: formData.celular || formData.telefono,
        datos_personales: { 
          tratamiento: formData.tratamiento, 
          apellido1: formData.apellido1,
          apellido2: formData.apellido2,
          celular: formData.celular,
          ciudad_nacimiento: formData.ciudad_nacimiento, 
          fecha_nacimiento: formData.fecha_nacimiento, 
          estado_civil: formData.estado_civil, 
          nacionalidad: formData.nacionalidad, 
          ciudad_residencia: formData.ciudad_residencia, 
          direccion: formData.direccion, 
          telefono_fijo: formData.telefono,
          consentimiento_datos: formData.consentimiento
        },
        datos_bancarios: { banco: 'PRODUBANCO', tipo_cuenta: formData.tipo_cuenta, numero_cuenta: formData.banco_produbanco },
        cargas_familiares: { conyuge: conyuge.tiene ? conyuge : null, hijos },
        estudios: [estudio], 
        documentos: documentosUrls,
        status: 'LLENADO',
        company_slug: companySlug
      }

      const { error: dbError } = await supabase.from('onboarding_candidates').update(payload).eq('email', formData.email.toLowerCase())
      if (dbError) throw dbError
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al guardar la información')
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <Check style={{ color: '#10b981', width: '64px', height: '64px', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px', color: '#111827' }}>Expediente Recibido</h2>
          <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.5' }}>Tu información ha sido registrada exitosamente. Recursos Humanos se pondrá en contacto contigo muy pronto.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .onboarding-container { font-family: system-ui, -apple-system, sans-serif; background-color: #000000; min-height: 100vh; color: #e5e7eb; }
        .onboarding-header { background-color: #111111; color: white; padding: 16px 24px; border-bottom: 2px solid #fbbf24; }
        .onboarding-title { margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #fbbf24 !important; }
        .onboarding-subtitle { margin: 4px 0 0; font-size: 13px; color: #e5e7eb; }
        .onboarding-main { max-width: 1000px; margin: 32px auto; padding: 0 16px; }
        .onboarding-card { background-color: #111111; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #333; }
        
        .tabs-container { display: flex; overflow-x: auto; border-bottom: 1px solid #333; background-color: #0a0a0a; }
        .tab-btn { flex: 1; min-width: 120px; padding: 16px; border: none; background: transparent; font-size: 14px; font-weight: 600; cursor: pointer; color: #9ca3af; position: relative; transition: all 0.2s; }
        .tab-btn:hover { color: #f3f4f6; background-color: #1a1a1a; }
        .tab-btn.active { color: #fbbf24; background-color: #111111; }
        .tab-indicator { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background-color: #fbbf24; }
        
        .content-area { padding: 40px; }
        .error-box { background-color: #450a0a; border: 1px solid #dc2626; color: #fca5a5; padding: 16px; border-radius: 6px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; font-size: 14px; }
        
        .section-title { font-size: 20px; font-weight: bold; margin: 0 0 24px; color: #fbbf24; border-bottom: 1px solid #333; padding-bottom: 8px; }
        
        .grid-1 { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 768px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
        
        .form-group { display: flex; flex-direction: column; }
        .form-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
        .form-input { padding: 10px 12px; border: 1px solid #333; border-radius: 6px; font-size: 14px; color: #ffffff; background-color: #1a1a1a; transition: border-color 0.2s; }
        .form-input:focus { outline: none; border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1); }
        select.form-input option { background-color: #1a1a1a; color: white; }
        
        .btn-primary { background-color: #fbbf24; color: #000000; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer; transition: background-color 0.2s; }
        .btn-primary:hover { background-color: #f59e0b; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .btn-secondary { background-color: #333; color: #e5e7eb; border: 1px solid #4b5563; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .btn-secondary:hover { background-color: #4b5563; }
        
        .actions-bar { margin-top: 40px; display: flex; justify-content: flex-end; }
        
        .req-box { background-color: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 8px; margin-bottom: 32px; }
        .req-title { color: #fbbf24; font-weight: bold; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
        
        .upload-area { border: 2px dashed #4b5563; border-radius: 8px; padding: 48px; text-align: center; cursor: pointer; background-color: #1a1a1a; transition: all 0.2s; }
        .upload-area:hover { background-color: #262626; border-color: #9ca3af; }
        .upload-area.has-file { border-color: #10b981; background-color: #064e3b; }

        .consent-box { background-color: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 8px; margin-top: 32px; }
        .consent-text-container { max-height: 200px; overflow-y: auto; background-color: #0a0a0a; border: 1px solid #333; padding: 12px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #d1d5db; margin-bottom: 20px; }
        .consent-options { display: grid; gap: 12px; }
        .consent-option { display: flex; gap: 12px; alignItems: center; cursor: pointer; padding: 12px; border-radius: 8px; transition: all 0.2s; border: 1px solid transparent; }
        .consent-option.accepted { background-color: #064e3b; border-color: #10b981; }
        .consent-option.rejected { background-color: #450a0a; border-color: #ef4444; }
        .consent-option-text { font-size: 13px; color: #f3f4f6; font-weight: 500; }
      `}</style>

      <div className="onboarding-container">
        <header className="onboarding-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="onboarding-title">{companyInfo.name}</h1>
            <p className="onboarding-subtitle">Ficha de Ingreso de Personal</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              background: '#1a1a1a', 
              border: '1px solid #fbbf24', 
              color: '#fbbf24', 
              padding: '10px 24px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              transition: 'all 0.2s'
            }}
          >
            Actualizar
          </button>
        </header>

        <main className="onboarding-main">
          <div className="onboarding-card">

            {/* TABS */}
            <div className="tabs-container">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
                  {tab.label}
                  {activeTab === tab.id && <div className="tab-indicator" />}
                </button>
              ))}
            </div>

            <div className="content-area">
              {error && (
                <div className="error-box">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1 */}
              {activeTab === 1 && (
                <div>
                  <h2 className="section-title">Bienvenido/a al equipo</h2>
                  <p style={{ color: '#d1d5db', lineHeight: 1.6, marginBottom: '32px' }}>{GET_WELCOME_TEXT(companyInfo.name)}</p>

                  <div className="req-box">
                    <div className="req-title"><FileCheck size={20} /> Documentos Solicitados</div>
                    <p style={{ color: '#e5e7eb', fontSize: '14px', marginBottom: '16px' }}>Por favor, prepara los siguientes documentos para subirlos en la pestaña final. (Los marcados con <span style={{ color: '#fbbf24' }}>*</span> son obligatorios):</p>
                    <div className="grid-2" style={{ color: '#d1d5db', fontSize: '13px' }}>
                      {getDynamicDocs().map((doc, i) => <div key={i}>• {doc}</div>)}
                    </div>
                  </div>

                  <div className="actions-bar"><button onClick={() => setActiveTab(2)} className="btn-primary">Siguiente</button></div>
                </div>
              )}

              {/* TAB 2 */}
              {activeTab === 2 && (
                <div>
                  <h2 className="section-title">Información Personal</h2>
                  <div className="grid-3">
                    <div className="form-group"><label className="form-label">Tratamiento *</label><select name="tratamiento" value={formData.tratamiento} onChange={handleChange} className="form-input"><option>Sr.</option><option>Sra.</option><option>Srta.</option></select></div>
                    <div className="form-group"><label className="form-label">Cédula *</label><input type="text" name="cedula" value={formData.cedula} onChange={handleChange} onBlur={(e) => checkCedula(e.target.value)} className="form-input" required maxLength={10} /></div>
                    <div className="form-group"><label className="form-label">Nacionalidad *</label><select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="form-input"><option>ECUADOR</option><option>COLOMBIA</option><option>VENEZUELA</option><option>OTRA</option></select></div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Dos Nombres *</label><input type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Primer Apellido *</label><input type="text" name="apellido1" value={formData.apellido1} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Segundo Apellido *</label><input type="text" name="apellido2" value={formData.apellido2} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Estado Civil *</label><select name="estado_civil" value={formData.estado_civil} onChange={handleChange} className="form-input"><option>Soltera/o</option><option>Casada/o</option><option>Unión de Hecho</option><option>Unión Libre</option><option>Divorciada/o</option></select></div>
                    <div className="form-group"><label className="form-label">Fecha Nacimiento *</label><input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Ciudad Nacimiento *</label><input type="text" name="ciudad_nacimiento" value={formData.ciudad_nacimiento} onChange={handleChange} className="form-input" /></div>
                  </div>

                  <h2 className="section-title" style={{ marginTop: '40px' }}>Contacto y Bancarios</h2>
                  <div className="grid-3">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Dirección Domiciliaria Exacta *</label><input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Ciudad Residencia *</label><input type="text" name="ciudad_residencia" value={formData.ciudad_residencia} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Teléfono Fijo *</label><input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Celular *</label><input type="text" name="celular" value={formData.celular} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Correo Electrónico *</label><input type="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="form-input" style={{ textTransform: 'lowercase' }} /></div>
                    <div className="form-group"><label className="form-label">Cuenta Produbanco *</label><input type="text" name="banco_produbanco" value={formData.banco_produbanco} onChange={handleChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Tipo de Cuenta *</label><select name="tipo_cuenta" value={formData.tipo_cuenta} onChange={handleChange} className="form-input"><option>Cuenta de Ahorros</option><option>Cuenta Corriente</option></select></div>
                  </div>
                  <div className="actions-bar"><button onClick={() => setActiveTab(3)} className="btn-primary">Siguiente</button></div>
                </div>
              )}

              {/* TAB 3 */}
              {activeTab === 3 && (
                <div>
                  <h2 className="section-title">Cónyuge o Pareja</h2>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', marginBottom: '24px' }}>
                    <input type="checkbox" checked={conyuge.tiene} onChange={e => setConyuge({ ...conyuge, tiene: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Declarar Cónyuge o Pareja en Unión Libre</span>
                  </label>

                  {conyuge.tiene && (
                    <div className="grid-2" style={{ marginBottom: '40px' }}>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Nombres Completos</label><input type="text" name="nombres" value={conyuge.nombres} onChange={handleConyugeChange} className="form-input" /></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Apellidos Completos</label><input type="text" name="apellidos" value={conyuge.apellidos} onChange={handleConyugeChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Cédula</label><input type="text" name="cedula" value={conyuge.cedula} onChange={handleConyugeChange} className="form-input" minLength={10} maxLength={10} /></div>
                      <div className="form-group"><label className="form-label">Fecha Nacimiento</label><input type="date" name="fecha_nacimiento" value={conyuge.fecha_nacimiento} onChange={handleConyugeChange} className="form-input" /></div>
                      <div className="form-group"><label className="form-label">Nacionalidad</label><select name="nacionalidad" value={conyuge.nacionalidad} onChange={handleConyugeChange} className="form-input"><option>ECUADOR</option><option>COLOMBIA</option><option>OTRA</option></select></div>
                      <div className="form-group"><label className="form-label">Ciudad Nacimiento</label><input type="text" name="ciudad_nacimiento" value={conyuge.ciudad_nacimiento} onChange={handleConyugeChange} className="form-input" /></div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#fbbf24' }}>Hijos Registrados ({hijos.length})</h2>
                    <button onClick={() => setHijos([...hijos, { nombres: '', apellidos: '', fecha_nacimiento: '', nacionalidad: 'Ecuador', ciudad_nacimiento: '', cedula: '' }])} style={{ background: '#333', color: '#fbbf24', border: '1px solid #fbbf24', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Agregar</button>
                  </div>

                  {hijos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#9ca3af', fontSize: '14px' }}>No hay hijos registrados.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {hijos.map((hijo, idx) => (
                        <div key={idx} style={{ padding: '24px', border: '1px solid #333', borderRadius: '6px', backgroundColor: '#1a1a1a', position: 'relative' }}>
                          <button onClick={() => setHijos(hijos.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={20} /></button>
                          <h4 style={{ margin: '0 0 16px', color: '#fbbf24' }}>Hijo #{idx + 1}</h4>
                          <div className="grid-2">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Nombres Completos</label><input type="text" value={hijo.nombres} onChange={e => { const n = [...hijos]; n[idx].nombres = e.target.value.toUpperCase(); setHijos(n); }} className="form-input" /></div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Apellidos Completos</label><input type="text" value={hijo.apellidos} onChange={e => { const n = [...hijos]; n[idx].apellidos = e.target.value.toUpperCase(); setHijos(n); }} className="form-input" /></div>
                            <div className="form-group"><label className="form-label">Cédula</label><input type="text" value={hijo.cedula} onChange={e => { const n = [...hijos]; n[idx].cedula = e.target.value.toUpperCase(); setHijos(n); }} className="form-input" minLength={10} maxLength={10} /></div>
                            <div className="form-group"><label className="form-label">Fecha Nacimiento</label><input type="date" value={hijo.fecha_nacimiento} onChange={e => { const n = [...hijos]; n[idx].fecha_nacimiento = e.target.value; setHijos(n); }} className="form-input" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="actions-bar">
                    <button onClick={() => {
                      if (conyuge.tiene && conyuge.cedula && conyuge.cedula.length !== 10) {
                        setError('La cédula del cónyuge debe tener 10 caracteres.');
                        return;
                      }
                      for (let i = 0; i < hijos.length; i++) {
                        if (hijos[i].cedula && hijos[i].cedula.length !== 10) {
                          setError(`La cédula del hijo #${i + 1} debe tener 10 caracteres.`);
                          return;
                        }
                      }
                      setError('');
                      setActiveTab(4);
                    }} className="btn-primary">Siguiente</button>
                  </div>
                </div>
              )}

              {/* TAB 4 */}
              {activeTab === 4 && (
                <div>
                  <h2 className="section-title">Nivel Académico</h2>
                  <div className="grid-2">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Nivel de Instrucción *</label><select name="nivel" value={estudio.nivel} onChange={handleEstudioChange} className="form-input"><option>SECUNDARIA</option><option>TÉCNICA Y SUPERIOR</option><option>UNIVERSITARIA</option><option>POST GRADO</option></select></div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Título Obtenido *</label><input type="text" name="titulo" value={estudio.titulo} onChange={handleEstudioChange} className="form-input" required /></div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Institución / Universidad *</label><input type="text" name="institucion" value={estudio.institucion} onChange={handleEstudioChange} className="form-input" required /></div>
                    <div className="form-group"><label className="form-label">Fecha Inicio</label><input type="date" name="fecha_inicio" value={estudio.fecha_inicio} onChange={handleEstudioChange} className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Fecha Fin</label><input type="date" name="fecha_fin" value={estudio.fecha_fin} onChange={handleEstudioChange} className="form-input" /></div>
                  </div>
                  <div className="actions-bar"><button onClick={() => setActiveTab(5)} className="btn-primary">Siguiente</button></div>
                </div>
              )}

              {/* TAB 5 */}
              {activeTab === 5 && (
                <div>
                  <h2 className="section-title">Carga de Documentos</h2>
                  <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>Por favor sube una copia legible de cada documento solicitado.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getDynamicDocs().map((doc) => (
                      <div key={doc} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px 16px', 
                        border: '1px solid #333', 
                        borderRadius: '8px',
                        background: files[doc] ? '#064e3b' : '#1a1a1a'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {files[doc] ? <CheckCircle2 size={18} color="#10b981" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #4b5563' }} />}
                          <span style={{ fontSize: '14px', fontWeight: 500, color: files[doc] ? '#10b981' : '#e5e7eb' }}>
                            {doc} {["Hoja de vida actualizada", "Diploma curso de primer nivel"].includes(doc) && <span style={{ color: '#fbbf24' }}>*</span>}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {files[doc] && (
                            <>
                              <span style={{ fontSize: '11px', color: '#059669' }}>{files[doc]!.name.substring(0, 10)}...</span>
                              <button 
                                onClick={() => window.open(URL.createObjectURL(files[doc]!), '_blank')} 
                                style={{ 
                                  padding: '6px', 
                                  borderRadius: '4px', 
                                  border: '1px solid #fbbf24', 
                                  background: '#333', 
                                  color: '#fbbf24',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Ver archivo subido"
                              >
                                <Eye size={14} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => document.getElementById(`file-${doc}`)?.click()} 
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '4px', 
                              border: '1px solid #4b5563', 
                              background: '#333', 
                              color: 'white', 
                              fontSize: '12px', 
                              cursor: 'pointer' 
                            }}
                          >
                            {files[doc] ? 'Cambiar' : 'Subir'}
                          </button>
                          <input 
                            type="file" 
                            id={`file-${doc}`} 
                            style={{ display: 'none' }} 
                            accept=".pdf"
                            onChange={(e) => handleFileChange(doc, e.target.files?.[0] || null)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="consent-box">
                    <div className="consent-text-container">
                      {CONSENT_TEXT(companyInfo.name, getPrivacyEmail(companySlug)).split('\n\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: para.includes(':') ? '8px' : '12px', fontWeight: para.startsWith('CONSENTIMIENTO') ? '800' : 'normal' }}>
                          {para}
                        </p>
                      ))}
                    </div>

                    <div className="consent-options">
                      <label className={`consent-option ${formData.consentimiento ? 'accepted' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="consentimiento" 
                          checked={formData.consentimiento} 
                          onChange={handleChange} 
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                        />
                        <span className="consent-option-text">
                          He leído y acepto el tratamiento de mis datos personales para la gestión de mi postulación, incluyendo el uso auxiliar de herramientas de inteligencia artificial para generar un resumen de mi perfil profesional y facilitar la revisión de mi hoja de vida por parte del área de DHO.
                        </span>
                      </label>

                      <label className={`consent-option ${formData.noAceptoConsentimiento ? 'rejected' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="noAceptoConsentimiento" 
                          checked={formData.noAceptoConsentimiento} 
                          onChange={handleChange} 
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                        />
                        <span className="consent-option-text">
                          He leído y no acepto el tratamiento de mis datos personales para la gestión de mi postulación, por lo que entiendo que no será posible continuar con mi registro y participación en los procesos de selección de {companyInfo.name}.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setActiveTab(4)} className="btn-secondary">Regresar</button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading || !formData.consentimiento} 
                      style={{ 
                        backgroundColor: (loading || !formData.consentimiento) ? '#94a3b8' : '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        padding: '12px 24px', 
                        borderRadius: '6px', 
                        fontWeight: 'bold', 
                        cursor: (loading || !formData.consentimiento) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Procesando...' : 'FINALIZAR Y ENVIAR FICHA'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </>
  )
}
