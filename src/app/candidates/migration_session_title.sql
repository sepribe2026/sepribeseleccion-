-- Agregar columna session_title a formative_candidates
-- Ejecutar en Supabase SQL Editor

ALTER TABLE formative_candidates 
ADD COLUMN IF NOT EXISTS session_title TEXT DEFAULT NULL;

-- Indice para filtrar por sesión eficientemente
CREATE INDEX IF NOT EXISTS idx_formative_candidates_session 
ON formative_candidates(session_title);
