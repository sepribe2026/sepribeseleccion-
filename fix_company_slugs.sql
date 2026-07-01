-- =====================================================
-- PASO 1: Verificar la estructura actual de admin_profiles
-- =====================================================
-- Ejecuta esto primero para ver qué columnas existen:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'admin_profiles';

-- =====================================================
-- PASO 2: Asegurarse de que existan las columnas necesarias
-- =====================================================
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS company_slug VARCHAR(100) DEFAULT 'sepribe';
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(200) DEFAULT 'SEPRIBE CIA.LTDA.';
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS perfil VARCHAR(50) DEFAULT 'RECLUTADOR';
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS ad_user VARCHAR(200);

-- =====================================================
-- PASO 3: Ver todos los perfiles actuales
-- (Ejecuta esto para ver qué usuarios existen y con qué empresa)
-- =====================================================
SELECT cedula, name, company_slug, company_name, perfil, ad_user, is_active
FROM admin_profiles
ORDER BY company_slug, name;

-- =====================================================
-- PASO 4: Actualizar los usuarios de MEDEPORTE
-- Reemplaza 'cedula_del_usuario' por la cédula real
-- =====================================================
-- UPDATE admin_profiles
-- SET company_slug = 'medeporte',
--     company_name = 'MEDEPORTE S.A.'
-- WHERE cedula IN ('CEDULA_USUARIO_MEDEPORTE_1', 'CEDULA_USUARIO_MEDEPORTE_2');

-- =====================================================
-- PASO 5: Actualizar los usuarios de EQUINOX
-- =====================================================
-- UPDATE admin_profiles
-- SET company_slug = 'equinox',
--     company_name = 'EQUINOX S.A.'
-- WHERE cedula IN ('CEDULA_USUARIO_EQUINOX_1');

-- =====================================================
-- PASO 6 (Opcional): Si los usuarios usan ad_user en vez de cédula
-- Ejemplo: si inician sesión con 'jperez' o 'jperez@ec.aseyco.com'
-- =====================================================
-- UPDATE admin_profiles
-- SET company_slug = 'medeporte',
--     company_name = 'MEDEPORTE S.A.',
--     ad_user = 'jperez'
-- WHERE cedula = 'CEDULA_DEL_USUARIO';

-- =====================================================
-- VERIFICACIÓN FINAL: Confirmar los cambios
-- =====================================================
SELECT cedula, name, company_slug, company_name, perfil, ad_user
FROM admin_profiles
ORDER BY company_slug;
