-- =====================================================
-- SCRIPT: Agregar nuevas columnas para la pantalla de postulación
-- =====================================================

ALTER TABLE email_resumes 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS civil_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS home_address TEXT,
ADD COLUMN IF NOT EXISTS sector VARCHAR(100),
ADD COLUMN IF NOT EXISTS education_institution VARCHAR(255),
ADD COLUMN IF NOT EXISTS education_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS heard_from VARCHAR(100),
ADD COLUMN IF NOT EXISTS likes_sports VARCHAR(50),
ADD COLUMN IF NOT EXISTS sports_practiced TEXT,
ADD COLUMN IF NOT EXISTS work_culture_motivation TEXT;
