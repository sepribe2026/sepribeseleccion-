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
  ('superdeporte', TRUE),
  ('medeport', TRUE),
  ('equinox', TRUE)
ON CONFLICT (company_slug) DO NOTHING;

-- 3. Habilitar seguridad RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas previas si existen (evita duplicados)
DROP POLICY IF EXISTS "Permitir lectura pública de configuración" ON company_settings;
DROP POLICY IF EXISTS "Permitir actualización a autenticados" ON company_settings;

-- 5. Crear políticas de acceso
-- Lectura pública para cualquier usuario que visite el portal de postulaciones
CREATE POLICY "Permitir lectura pública de configuración" 
  ON company_settings FOR SELECT 
  USING (TRUE);

-- Modificación solo para usuarios autenticados (reclutadores y administradores)
CREATE POLICY "Permitir actualización a autenticados" 
  ON company_settings FOR UPDATE 
  TO authenticated 
  USING (TRUE);
