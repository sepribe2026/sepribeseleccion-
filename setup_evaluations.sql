
-- 1. Añadir configuración a la tabla de cargos
ALTER TABLE public.job_positions
ADD COLUMN IF NOT EXISTS test_config JSONB DEFAULT '{"etica": false, "disc": false}'::jsonb;

-- 2. Crear tabla de banco de preguntas
CREATE TABLE IF NOT EXISTS public.evaluation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type VARCHAR(50) NOT NULL, -- Ej: 'ETICA', 'DISC'
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Ej: [{"text": "Opción A", "score": 10, "disc_axis": "D"}]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para preguntas
ALTER TABLE public.evaluation_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso público lectura preguntas" ON public.evaluation_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin CRUD preguntas" ON public.evaluation_questions USING (true); -- Ajustar según política admin real

-- 3. Crear tabla para guardar resultados de candidatos
CREATE TABLE IF NOT EXISTS public.candidate_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.email_resumes(id) ON DELETE CASCADE,
  test_type VARCHAR(50) NOT NULL,
  score JSONB, -- Puede ser un número o un desglose de DISC
  responses JSONB NOT NULL, -- Respuestas exactas que dio el candidato
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para resultados
ALTER TABLE public.candidate_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidatos pueden insertar sus resultados" ON public.candidate_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin lectura resultados" ON public.candidate_evaluations FOR SELECT USING (true);

-- Notificar recarga de schema para PostgREST
NOTIFY pgrst, 'reload schema';

