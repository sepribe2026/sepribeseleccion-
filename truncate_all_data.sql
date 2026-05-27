-- =======================================================
-- BORRAR TODA LA DATA DE LA BASE DE DATOS
-- (mantiene las tablas/estructura, solo borra registros)
-- EJECUTAR EN SUPABASE > SQL Editor
-- =======================================================

-- 1. Deshabilitar temporalmente restricciones FK para evitar errores de orden
SET session_replication_role = 'replica';

-- ─── MÓDULO FORMATIVAS ───────────────────────────────
TRUNCATE TABLE recruiter_active_candidate RESTART IDENTITY CASCADE;
TRUNCATE TABLE formative_evaluations       RESTART IDENTITY CASCADE;
TRUNCATE TABLE formative_candidates        RESTART IDENTITY CASCADE;
TRUNCATE TABLE formative_supervisors       RESTART IDENTITY CASCADE;
TRUNCATE TABLE formative_options           RESTART IDENTITY CASCADE;

-- ─── MÓDULO DE CANDIDATOS / PIPELINE ─────────────────
TRUNCATE TABLE candidate_tracking          RESTART IDENTITY CASCADE;
TRUNCATE TABLE candidate_psychometric_tests RESTART IDENTITY CASCADE;
TRUNCATE TABLE email_resumes               RESTART IDENTITY CASCADE;

-- ─── MÓDULO ZERO PAPER ───────────────────────────────
TRUNCATE TABLE consents                    RESTART IDENTITY CASCADE;
TRUNCATE TABLE documents                   RESTART IDENTITY CASCADE;
TRUNCATE TABLE employees                   RESTART IDENTITY CASCADE;

-- ─── MÓDULO DE USUARIOS / CONFIGURACIÓN ──────────────
TRUNCATE TABLE company_settings            RESTART IDENTITY CASCADE;
TRUNCATE TABLE job_positions               RESTART IDENTITY CASCADE;
TRUNCATE TABLE users                       RESTART IDENTITY CASCADE;

-- ─── AUDITORÍA ────────────────────────────────────────
TRUNCATE TABLE audit_logs                  RESTART IDENTITY CASCADE;

-- 2. Re-habilitar restricciones FK
SET session_replication_role = 'origin';

-- Confirmar
SELECT 'Todos los datos han sido borrados exitosamente.' AS resultado;
