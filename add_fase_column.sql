-- Migración: agregar columna fase a formative_candidates para el flujo de Fase 2
-- Ejecutar en Supabase → SQL Editor

ALTER TABLE formative_candidates
ADD COLUMN IF NOT EXISTS fase INTEGER DEFAULT 1;

-- Índice para optimizar consultas de Fase 2
CREATE INDEX IF NOT EXISTS idx_formative_candidates_fase
  ON formative_candidates (fase);
