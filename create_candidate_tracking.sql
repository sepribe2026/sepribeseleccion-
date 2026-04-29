-- =====================================================
-- Tabla de seguimiento de candidatos por cargo
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_tracking (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id      UUID NOT NULL,
  cargo          VARCHAR(150) NOT NULL,
  status         VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  -- Estados: PENDIENTE | MENSAJE_ENVIADO | ENTREVISTA_PROGRAMADA | ONBOARDING
  interview_date DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resume_id, cargo)
);

ALTER TABLE candidate_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública tracking"
  ON candidate_tracking FOR SELECT USING (true);

CREATE POLICY "Inserción pública tracking"
  ON candidate_tracking FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización pública tracking"
  ON candidate_tracking FOR UPDATE USING (true);
