-- Migración: agregar columna is_evaluating a formative_candidates
-- Ejecutar en Supabase → SQL Editor

ALTER TABLE formative_candidates
ADD COLUMN IF NOT EXISTS is_evaluating BOOLEAN DEFAULT FALSE;

-- Índice para acelerar el query en la pantalla de evaluación
CREATE INDEX IF NOT EXISTS idx_formative_candidates_is_evaluating
  ON formative_candidates (is_evaluating)
  WHERE is_evaluating = TRUE;
