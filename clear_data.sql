-- ==========================================
-- SCRIPT DE LIMPIEZA TOTAL (CORREGIDO)
-- ==========================================

-- 1. Eliminar datos de seguimiento (Pipeline / Resumen)
DELETE FROM candidate_tracking;

-- 2. Eliminar datos de Onboarding (Candidatos en proceso de ingreso)
DELETE FROM onboarding_candidates;

-- 3. Eliminar datos de Inbox / Ranking (Resumes analizados por IA)
DELETE FROM email_resumes;

-- Nota: Si usas TRUNCATE, asegúrate de tener permisos de dueño de tabla. 
-- DELETE es más seguro si solo eres usuario con permisos de borrado.
