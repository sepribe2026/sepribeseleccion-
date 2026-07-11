-- Añadir nuevas columnas a email_resumes para la versión 2 del formulario de postulación
ALTER TABLE email_resumes
ADD COLUMN IF NOT EXISTS contacto_adicional VARCHAR(100),
ADD COLUMN IF NOT EXISTS worked_in_sepribe VARCHAR(50),
ADD COLUMN IF NOT EXISTS reentrenamiento_vigente VARCHAR(50),
ADD COLUMN IF NOT EXISTS own_transport VARCHAR(50),
ADD COLUMN IF NOT EXISTS supervisor_course VARCHAR(50),
ADD COLUMN IF NOT EXISTS console_course VARCHAR(50),
ADD COLUMN IF NOT EXISTS vip_course VARCHAR(50),
ADD COLUMN IF NOT EXISTS cedula_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS diploma_120h_url TEXT,
ADD COLUMN IF NOT EXISTS diploma_nivel_ii_url TEXT,
ADD COLUMN IF NOT EXISTS diploma_reentrenamiento_url TEXT,
ADD COLUMN IF NOT EXISTS historial_laboral_url TEXT,
ADD COLUMN IF NOT EXISTS certificados_trabajo_url TEXT;
