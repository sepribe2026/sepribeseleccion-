-- =======================================================
-- MÓDULO DE EVALUACIONES FORMATIVAS Y SUPERVISORES
-- =======================================================

-- 1. Tabla de Supervisores
CREATE TABLE IF NOT EXISTS formative_supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Candidatos Seleccionados para Formativas
CREATE TABLE IF NOT EXISTS formative_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID UNIQUE REFERENCES email_resumes(id) ON DELETE CASCADE,
  interview_date DATE,
  interview_time TIME,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Asignaciones (Supervisores asignados a Candidatos)
CREATE TABLE IF NOT EXISTS formative_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES formative_candidates(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES formative_supervisors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, supervisor_id)
);

-- 4. Opciones de Evaluación Predefinidas (Configurables)
CREATE TABLE IF NOT EXISTS formative_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(500) NOT NULL,
  weight INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Evaluaciones de Supervisores
CREATE TABLE IF NOT EXISTS formative_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES formative_candidates(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES formative_supervisors(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  selected_options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de IDs de formative_options
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, supervisor_id)
);

-- 6. Agregar columna de Candidato Activo en company_settings
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS active_evaluating_candidate_id UUID REFERENCES formative_candidates(id) ON DELETE SET NULL;

-- 7. Habilitar RLS en todas las nuevas tablas
ALTER TABLE formative_supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE formative_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE formative_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE formative_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE formative_evaluations ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas de acceso público (Para simplificar la conexión en frontend sin auth nativo)
DROP POLICY IF EXISTS "Permitir select público supervisores" ON formative_supervisors;
DROP POLICY IF EXISTS "Permitir insert público supervisores" ON formative_supervisors;
DROP POLICY IF EXISTS "Permitir update público supervisores" ON formative_supervisors;
DROP POLICY IF EXISTS "Permitir delete público supervisores" ON formative_supervisors;

CREATE POLICY "Permitir select público supervisores" ON formative_supervisors FOR SELECT USING (true);
CREATE POLICY "Permitir insert público supervisores" ON formative_supervisors FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público supervisores" ON formative_supervisors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público supervisores" ON formative_supervisors FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir select público candidatos formativas" ON formative_candidates;
DROP POLICY IF EXISTS "Permitir insert público candidatos formativas" ON formative_candidates;
DROP POLICY IF EXISTS "Permitir update público candidatos formativas" ON formative_candidates;
DROP POLICY IF EXISTS "Permitir delete público candidatos formativas" ON formative_candidates;

CREATE POLICY "Permitir select público candidatos formativas" ON formative_candidates FOR SELECT USING (true);
CREATE POLICY "Permitir insert público candidatos formativas" ON formative_candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público candidatos formativas" ON formative_candidates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público candidatos formativas" ON formative_candidates FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir select público asignaciones" ON formative_assignments;
DROP POLICY IF EXISTS "Permitir insert público asignaciones" ON formative_assignments;
DROP POLICY IF EXISTS "Permitir delete público asignaciones" ON formative_assignments;

CREATE POLICY "Permitir select público asignaciones" ON formative_assignments FOR SELECT USING (true);
CREATE POLICY "Permitir insert público asignaciones" ON formative_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir delete público asignaciones" ON formative_assignments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir select público opciones" ON formative_options;
DROP POLICY IF EXISTS "Permitir insert público opciones" ON formative_options;
DROP POLICY IF EXISTS "Permitir update público opciones" ON formative_options;
DROP POLICY IF EXISTS "Permitir delete público opciones" ON formative_options;

CREATE POLICY "Permitir select público opciones" ON formative_options FOR SELECT USING (true);
CREATE POLICY "Permitir insert público opciones" ON formative_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público opciones" ON formative_options FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público opciones" ON formative_options FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir select público evaluaciones" ON formative_evaluations;
DROP POLICY IF EXISTS "Permitir insert público evaluaciones" ON formative_evaluations;
DROP POLICY IF EXISTS "Permitir update público evaluaciones" ON formative_evaluations;
DROP POLICY IF EXISTS "Permitir delete público evaluaciones" ON formative_evaluations;

CREATE POLICY "Permitir select público evaluaciones" ON formative_evaluations FOR SELECT USING (true);
CREATE POLICY "Permitir insert público evaluaciones" ON formative_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update público evaluaciones" ON formative_evaluations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete público evaluaciones" ON formative_evaluations FOR DELETE USING (true);

-- 9. Insertar las opciones iniciales requeridas por el usuario
INSERT INTO formative_options (label, weight, category) VALUES
  ('NO ME GUSTA SU IMAGEN UN POCO GORDITA/IMPULSADORA', -10, 'Imagen y Actitud'),
  ('ME ENCANTA COMO SE DESENVUELVE Y PARTICIPA MUCHO BOXEO', 20, 'Imagen y Actitud'),
  ('NO ME GUSTA NADA HE FALLADO,IMAGEN FUTBOL', -20, 'Imagen y Actitud'),
  ('UN POCO TIMIDO BODEGA, BOXEO', 10, 'Imagen y Actitud'),
  ('Excelente desenvolvimiento verbal y fluidez', 15, 'Desenvolvimiento'),
  ('Actitud proactiva y respuestas asertivas', 15, 'Desenvolvimiento'),
  ('Muestra dificultades para seguir el ritmo del grupo', -5, 'Desenvolvimiento')
ON CONFLICT DO NOTHING;
