-- =========================================================================
-- ESQUEMA DE BASE DE DATOS COMPLETO PARA EL AMBIENTE SEPRIBE (SUPABASE)
-- Ejecutar este script en el editor de SQL de Supabase (SQL Editor)
-- =========================================================================

-- Habilitar extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: admin_profiles (Perfiles administrativos autorizados)
CREATE TABLE IF NOT EXISTS admin_profiles (
  cedula VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  company_slug VARCHAR(100) DEFAULT 'superdeporte',
  company_name VARCHAR(200) DEFAULT 'SEPRIBE CIA.LTDA.',
  perfil VARCHAR(50) DEFAULT 'RECLUTADOR',
  ad_user VARCHAR(200)
);

-- Semilla inicial para administrador local (admin/admin bypass)
INSERT INTO admin_profiles (cedula, name, company_slug, company_name, perfil, ad_user)
VALUES ('admin', 'Administrador Local', 'superdeporte', 'SEPRIBE CIA.LTDA.', 'ADMIN', 'admin')
ON CONFLICT (cedula) DO NOTHING;

-- Semilla original
INSERT INTO admin_profiles (cedula, name, company_slug, company_name, perfil) 
VALUES ('1714639026', 'Administrador Sistema', 'superdeporte', 'SEPRIBE CIA.LTDA.', 'ADMIN')
ON CONFLICT (cedula) DO NOTHING;


-- 2. TABLA: email_resumes (Hojas de vida extraídas o postuladas)
CREATE TABLE IF NOT EXISTS email_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_uid VARCHAR(255) UNIQUE NOT NULL, -- Identificador único (correo o postulación)
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    subject TEXT,
    received_date TIMESTAMPTZ,
    
    -- Información del archivo de CV
    file_name TEXT,
    pdf_url TEXT,
    
    -- Estados y Auditoría
    classification_status VARCHAR(50) DEFAULT 'PENDING',
    created_by_cedula VARCHAR(20) REFERENCES admin_profiles(cedula) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Campos de postulación (Ingreso manual/Formulario)
    gender VARCHAR(100),
    birth_date DATE,
    civil_status VARCHAR(100),
    home_address TEXT,
    sector VARCHAR(100),
    education_institution VARCHAR(255),
    education_title VARCHAR(255),
    heard_from VARCHAR(100),
    likes_sports VARCHAR(50),
    sports_practiced TEXT,
    work_culture_motivation TEXT,
    
    -- Campos analizados por IA (Resumen)
    ai_summary TEXT,
    city VARCHAR(100),
    position VARCHAR(150),
    experience_years VARCHAR(50),
    education_level VARCHAR(100),
    skills TEXT,
    languages TEXT,
    availability VARCHAR(100),
    age VARCHAR(20)
);

-- RLS para email_resumes
ALTER TABLE email_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir insercion total" ON email_resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura general" ON email_resumes FOR SELECT USING (true);
CREATE POLICY "Permitir actualizacion general" ON email_resumes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir borrado general" ON email_resumes FOR DELETE USING (true);


-- 3. TABLA: candidate_tracking (Seguimiento del estado de candidatos)
CREATE TABLE IF NOT EXISTS candidate_tracking (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id      UUID NOT NULL REFERENCES email_resumes(id) ON DELETE CASCADE,
  cargo          VARCHAR(150) NOT NULL,
  status         VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, MENSAJE_ENVIADO, ENTREVISTA_PROGRAMADA, ONBOARDING
  interview_date DATE,
  notes          TEXT,
  created_by_cedula VARCHAR(20) REFERENCES admin_profiles(cedula) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resume_id, cargo)
);

-- RLS para candidate_tracking
ALTER TABLE candidate_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública tracking" ON candidate_tracking FOR SELECT USING (true);
CREATE POLICY "Inserción pública tracking" ON candidate_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización pública tracking" ON candidate_tracking FOR UPDATE USING (true);


-- 4. TABLA: company_settings (Configuración de postulación activa por empresa)
CREATE TABLE IF NOT EXISTS company_settings (
  company_slug VARCHAR(50) PRIMARY KEY,
  postulation_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Valores iniciales para las empresas
INSERT INTO company_settings (company_slug, postulation_enabled) VALUES
  ('superdeporte', TRUE),
  ('medeport', TRUE),
  ('equinox', TRUE)
ON CONFLICT (company_slug) DO NOTHING;

-- RLS para company_settings
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de configuración" ON company_settings FOR SELECT USING (TRUE);
CREATE POLICY "Permitir inserción pública de configuración" ON company_settings FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Permitir actualización pública de configuración" ON company_settings FOR UPDATE USING (TRUE) WITH CHECK (TRUE);


-- 5. TABLA: formative_supervisors (Supervisores de evaluaciones formativas)
CREATE TABLE IF NOT EXISTS formative_supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_by_user VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT formative_supervisors_email_created_by_user_key UNIQUE (email, created_by_user)
);

-- RLS para formative_supervisors
ALTER TABLE formative_supervisors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select público supervisores" ON formative_supervisors FOR SELECT USING (true);
CREATE POLICY "Permitir insert público supervisores" ON formative_supervisors FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público supervisores" ON formative_supervisors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público supervisores" ON formative_supervisors FOR DELETE USING (true);


-- 6. TABLA: formative_candidates (Candidatos en fase de inducción formativa)
CREATE TABLE IF NOT EXISTS formative_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES email_resumes(id) ON DELETE CASCADE,
  interview_date DATE,
  interview_time TIME,
  email_sent BOOLEAN DEFAULT FALSE,
  created_by_user VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  fase INTEGER DEFAULT 1,
  confirmed BOOLEAN DEFAULT FALSE,
  attended BOOLEAN DEFAULT FALSE,
  is_evaluating BOOLEAN DEFAULT FALSE,
  CONSTRAINT formative_candidates_resume_id_created_by_user_key UNIQUE (resume_id, created_by_user)
);

-- Índices de optimización
CREATE INDEX IF NOT EXISTS idx_formative_candidates_fase ON formative_candidates (fase);
CREATE INDEX IF NOT EXISTS idx_formative_candidates_is_evaluating ON formative_candidates (is_evaluating) WHERE is_evaluating = TRUE;

-- RLS para formative_candidates
ALTER TABLE formative_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select público candidatos formativas" ON formative_candidates FOR SELECT USING (true);
CREATE POLICY "Permitir insert público candidatos formativas" ON formative_candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público candidatos formativas" ON formative_candidates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público candidatos formativas" ON formative_candidates FOR DELETE USING (true);


-- 7. TABLA: formative_options (Opciones de evaluación con pesos numéricos)
CREATE TABLE IF NOT EXISTS formative_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(500) NOT NULL,
  weight INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opciones iniciales para el sistema de calificación
INSERT INTO formative_options (label, weight, category) VALUES
  ('NO ME GUSTA SU IMAGEN UN POCO GORDITA/IMPULSADORA', -10, 'Imagen y Actitud'),
  ('ME ENCANTA COMO SE DESENVUELVE Y PARTICIPA MUCHO BOXEO', 20, 'Imagen y Actitud'),
  ('NO ME GUSTA NADA HE FALLADO,IMAGEN FUTBOL', -20, 'Imagen y Actitud'),
  ('UN POCO TIMIDO BODEGA, BOXEO', 10, 'Imagen y Actitud'),
  ('Excelente desenvolvimiento verbal y fluidez', 15, 'Desenvolvimiento'),
  ('Actitud proactiva y respuestas asertivas', 15, 'Desenvolvimiento'),
  ('Muestra dificultades para seguir el ritmo del grupo', -5, 'Desenvolvimiento')
ON CONFLICT DO NOTHING;

-- RLS para formative_options
ALTER TABLE formative_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select público opciones" ON formative_options FOR SELECT USING (true);
CREATE POLICY "Permitir insert público opciones" ON formative_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público opciones" ON formative_options FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público opciones" ON formative_options FOR DELETE USING (true);


-- 8. TABLA: formative_evaluations (Calificaciones enviadas por los supervisores)
CREATE TABLE IF NOT EXISTS formative_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES formative_candidates(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES formative_supervisors(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  selected_options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de IDs de formative_options
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, supervisor_id)
);

-- RLS para formative_evaluations
ALTER TABLE formative_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select público evaluaciones" ON formative_evaluations FOR SELECT USING (true);
CREATE POLICY "Permitir insert público evaluaciones" ON formative_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público evaluaciones" ON formative_evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público evaluaciones" ON formative_evaluations FOR DELETE USING (true);


-- 9. TABLA: recruiter_active_candidate (Control de evaluación en tiempo real)
CREATE TABLE IF NOT EXISTS recruiter_active_candidate (
  recruiter_user VARCHAR(255) PRIMARY KEY,
  active_candidate_id UUID REFERENCES formative_candidates(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para recruiter_active_candidate
ALTER TABLE recruiter_active_candidate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select público recruiter_active_candidate" ON recruiter_active_candidate FOR SELECT USING (true);
CREATE POLICY "Permitir insert/update/delete público recruiter_active_candidate" ON recruiter_active_candidate FOR ALL USING (true);


-- 10. TABLA: candidate_psychometric_tests (Evaluaciones Psicométricas)
CREATE TABLE IF NOT EXISTS candidate_psychometric_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES email_resumes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, INICIADO, COMPLETADO
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Áreas de evaluación
    verbal_score INTEGER DEFAULT 0,
    espacial_score INTEGER DEFAULT 0,
    logico_score INTEGER DEFAULT 0,
    numerico_score INTEGER DEFAULT 0,
    abstracto_score INTEGER DEFAULT 0,
    ethics_score INTEGER DEFAULT 0,
    
    -- DISC/Kudert
    kudert_disc JSONB DEFAULT '{}'::jsonb,
    sections_status JSONB DEFAULT '{"verbal": "PENDIENTE", "espacial": "PENDIENTE", "logico": "PENDIENTE", "numerico": "PENDIENTE", "abstracto": "PENDIENTE", "ethics": "PENDIENTE", "kudert": "PENDIENTE"}'::jsonb,
    
    -- Almacenamiento de preguntas fijadas y respuestas dadas
    generated_questions JSONB DEFAULT '{}'::jsonb,
    answers JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(resume_id)
);

-- RLS para candidate_psychometric_tests
ALTER TABLE candidate_psychometric_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública psicometrico" ON candidate_psychometric_tests FOR SELECT USING (true);
CREATE POLICY "Inserción pública psicometrico" ON candidate_psychometric_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización pública psicometrico" ON candidate_psychometric_tests FOR UPDATE USING (true);
CREATE POLICY "Eliminación pública psicometrico" ON candidate_psychometric_tests FOR DELETE USING (true);


-- 11. TABLA: job_positions (Cargos predefinidos y sus funciones)
CREATE TABLE IF NOT EXISTS job_positions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo       VARCHAR(150) NOT NULL,
  ciudad      VARCHAR(100),
  funciones   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Cargos por defecto
INSERT INTO job_positions (cargo, ciudad, funciones) VALUES
(
  'Cajero',
  'Quito',
  'Manejo de caja registradora y POS. Cobro en efectivo y tarjetas de crédito/débito. Cuadre y cierre de caja al final del turno. Atención al cliente en punto de pago. Manejo básico de sistemas de facturación. Honestidad y responsabilidad con valores monetarios. Orientación al servicio al cliente.'
),
(
  'Vendedor',
  'Quito',
  'Asesoramiento y venta de productos al cliente. Cumplimiento de metas y cuotas de ventas mensuales. Mantenimiento y organización del área de ventas. Conocimiento de catálogo y características de productos. Excelente comunicación y trato con clientes. Capacidad de trabajo bajo presión. Experiencia en retail o ventas presenciales.'
),
(
  'Bodeguero',
  'Quito',
  'Recepción y verificación de mercadería. Control y registro de inventario. Organización de bodega y productos. Despacho de productos a las áreas solicitadas. Manejo de montacargas o transpaletas (deseable). Registro en sistema de gestión de inventarios. Trabajo físico y en ambientes de almacenamiento.'
)
ON CONFLICT DO NOTHING;

-- RLS para job_positions
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso público lectura job_positions" ON job_positions FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción job_positions" ON job_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público eliminación job_positions" ON job_positions FOR DELETE USING (true);


-- 12. TABLA: onboarding_candidates (Ficha de ingreso del portal Onboarding)
CREATE TABLE IF NOT EXISTS onboarding_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    
    -- Estructuras JSON para datos dinámicos
    datos_personales JSONB,
    datos_bancarios JSONB,
    cargas_familiares JSONB,
    estudios JSONB,
    
    -- Documentos subidos
    documento_pdf_url TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, SYNCED
    created_by_cedula VARCHAR(20) REFERENCES admin_profiles(cedula) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para onboarding_candidates
ALTER TABLE onboarding_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserción pública" ON onboarding_candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura autenticada" ON onboarding_candidates FOR SELECT USING (true);
CREATE POLICY "Permitir actualización autenticada" ON onboarding_candidates FOR UPDATE USING (true);


-- =========================================================================
-- CONFIGURACIÓN DE STORAGE BUCKETS (Supabase Storage)
-- =========================================================================
-- Ejecutar el siguiente INSERT para crear el bucket de documentos de candidatos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('candidate-documents', 'candidate-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el Bucket del Storage
CREATE POLICY "Permitir subida pública de documentos"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'candidate-documents' );

CREATE POLICY "Permitir lectura de documentos"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'candidate-documents' );

CREATE POLICY "Permitir borrado autenticado"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id = 'candidate-documents' );
