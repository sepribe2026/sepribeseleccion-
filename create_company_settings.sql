-- ==========================================
-- SCRIPT: Configuración de Postulación por Empresa
-- ==========================================

-- 1. Crear tabla de configuración por empresa
CREATE TABLE IF NOT EXISTS company_settings (
  company_slug VARCHAR(50) PRIMARY KEY,
  postulation_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insertar valores iniciales para las 3 compañías
INSERT INTO company_settings (company_slug, postulation_enabled) VALUES
  ('sepribe', TRUE),
  ('medeport', TRUE),
  ('equinox', TRUE)
ON CONFLICT (company_slug) DO NOTHING;

-- 3. Habilitar seguridad RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas previas si existen (evita duplicados)
DROP POLICY IF EXISTS "Permitir lectura pública de configuración" ON company_settings;
DROP POLICY IF EXISTS "Permitir actualización a autenticados" ON company_settings;
DROP POLICY IF EXISTS "Permitir todo a autenticados" ON company_settings;
DROP POLICY IF EXISTS "Permitir actualización pública de configuración" ON company_settings;
DROP POLICY IF EXISTS "Permitir inserción pública de configuración" ON company_settings;

-- 5. Crear políticas de acceso público
-- (El frontend se comunica de forma anónima con Supabase al no usar Supabase Auth de forma nativa)
CREATE POLICY "Permitir lectura pública de configuración" 
  ON company_settings FOR SELECT 
  USING (TRUE);

CREATE POLICY "Permitir inserción pública de configuración" 
  ON company_settings FOR INSERT 
  WITH CHECK (TRUE);

CREATE POLICY "Permitir actualización pública de configuración" 
  ON company_settings FOR UPDATE 
  USING (TRUE)
  WITH CHECK (TRUE);
