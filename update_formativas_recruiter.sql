-- 1. Modificar formative_supervisors para soportar created_by_user
ALTER TABLE formative_supervisors ADD COLUMN IF NOT EXISTS created_by_user VARCHAR(255);
ALTER TABLE formative_supervisors DROP CONSTRAINT IF EXISTS formative_supervisors_email_key;
ALTER TABLE formative_supervisors DROP CONSTRAINT IF EXISTS formative_supervisors_email_created_by_user_key;
ALTER TABLE formative_supervisors ADD CONSTRAINT formative_supervisors_email_created_by_user_key UNIQUE (email, created_by_user);

-- 2. Modificar formative_candidates para soportar created_by_user
ALTER TABLE formative_candidates ADD COLUMN IF NOT EXISTS created_by_user VARCHAR(255);

-- 3. Crear tabla para el control de candidato activo por reclutador
CREATE TABLE IF NOT EXISTS recruiter_active_candidate (
  recruiter_user VARCHAR(255) PRIMARY KEY,
  active_candidate_id UUID REFERENCES formative_candidates(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE recruiter_active_candidate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select público recruiter_active_candidate" ON recruiter_active_candidate;
DROP POLICY IF EXISTS "Permitir insert/update/delete público recruiter_active_candidate" ON recruiter_active_candidate;
CREATE POLICY "Permitir select público recruiter_active_candidate" ON recruiter_active_candidate FOR SELECT USING (true);
CREATE POLICY "Permitir insert/update/delete público recruiter_active_candidate" ON recruiter_active_candidate FOR ALL USING (true);
