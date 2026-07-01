-- =========================================================================
-- SCRIPT: Agregar columnas específicas de reclutamiento de seguridad
-- Ejecutar en el SQL Editor de tu proyecto de Supabase
-- =========================================================================

ALTER TABLE email_resumes 
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20),
ADD COLUMN IF NOT EXISTS military_experience VARCHAR(50),
ADD COLUMN IF NOT EXISTS guard_course VARCHAR(50),
ADD COLUMN IF NOT EXISTS estatura INTEGER,
ADD COLUMN IF NOT EXISTS rotating_shifts VARCHAR(50),
ADD COLUMN IF NOT EXISTS driving_license VARCHAR(100),
ADD COLUMN IF NOT EXISTS course_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS record_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS driver_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS company_slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS main_achievement TEXT,
ADD COLUMN IF NOT EXISTS key_tools TEXT;

-- Agregar columnas necesarias para la gestión de cargos por compañía
ALTER TABLE job_positions
ADD COLUMN IF NOT EXISTS company_slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_by_cedula VARCHAR(50);
-- Agregar políticas de actualización faltantes para job_positions
DROP POLICY IF EXISTS "Acceso público actualización job_positions" ON job_positions;
CREATE POLICY "Acceso público actualización job_positions" ON job_positions FOR UPDATE USING (true);

-- Actualizar cargos existentes para que pertenezcan a la compañía SEPRIBE
UPDATE job_positions 
SET company_slug = 'sepribe' 
WHERE company_slug IS NULL OR company_slug = 'superdeporte';
