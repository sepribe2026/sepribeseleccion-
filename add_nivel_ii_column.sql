-- Añadir la columna nivel_ii_course a email_resumes
ALTER TABLE email_resumes
ADD COLUMN IF NOT EXISTS nivel_ii_course VARCHAR(50);
