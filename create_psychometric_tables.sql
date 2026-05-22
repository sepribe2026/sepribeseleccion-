-- =====================================================
-- Tabla de Evaluaciones Psicométricas de Candidatos
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_psychometric_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES email_resumes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, INICIADO, COMPLETADO
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Puntajes individuales de las áreas (0 a 100)
    verbal_score INTEGER DEFAULT 0,
    espacial_score INTEGER DEFAULT 0,
    logico_score INTEGER DEFAULT 0,
    numerico_score INTEGER DEFAULT 0,
    abstracto_score INTEGER DEFAULT 0,
    ethics_score INTEGER DEFAULT 0,
    
    -- Resultados del perfil Kudert/DISC
    kudert_disc JSONB DEFAULT '{}'::jsonb, -- { "D": 75, "I": 60, "S": 40, "C": 90 }
    
    -- Estado de progreso por sección
    sections_status JSONB DEFAULT '{"verbal": "PENDIENTE", "espacial": "PENDIENTE", "logico": "PENDIENTE", "numerico": "PENDIENTE", "abstracto": "PENDIENTE", "ethics": "PENDIENTE", "kudert": "PENDIENTE"}'::jsonb,
    
    -- Preguntas aleatorias generadas fijas para este candidato
    generated_questions JSONB DEFAULT '{}'::jsonb,
    answers JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(resume_id)
);

-- RLS & Políticas
ALTER TABLE candidate_psychometric_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública psicometrico" 
    ON candidate_psychometric_tests FOR SELECT USING (true);

CREATE POLICY "Inserción pública psicometrico" 
    ON candidate_psychometric_tests FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización pública psicometrico" 
    ON candidate_psychometric_tests FOR UPDATE USING (true);

CREATE POLICY "Eliminación pública psicometrico" 
    ON candidate_psychometric_tests FOR DELETE USING (true);
