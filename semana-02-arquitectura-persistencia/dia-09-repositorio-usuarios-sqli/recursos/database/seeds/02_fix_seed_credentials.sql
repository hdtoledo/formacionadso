-- ==============================================================================
-- SENA CADPH Garzón · Regional Huila · ADSO
-- Sesión 09 · Hito 0: Corrección de la semilla de desarrollo
-- Archivo: database/seeds/02_fix_seed_credentials.sql
-- ==============================================================================
-- ⚠️ SOLO DESARROLLO LOCAL. Estas contraseñas son públicas (están en GitHub):
--    NUNCA se ejecuta esta semilla en la base de datos de producción.
--
-- Va en seeds/ y no en migrations/ porque son DATOS de prueba, no estructura:
-- las migraciones sí se ejecutan en producción; las semillas de desarrollo no.
--
-- Ejecución (psql), DESPUÉS de la migración 02:
--   \i database/seeds/02_fix_seed_credentials.sql
-- ==============================================================================

BEGIN;

-- 1. Hashes bcrypt REALES (cost 12). Los de la semilla anterior no correspondían
--    a ninguna contraseña, y el login de la Sesión 14 habría fallado siempre.
--    Admin2026*    -> admin@sena.edu.co
--    Aprendiz2026* -> aprendiz.adso@misena.edu.co
UPDATE users
   SET password_hash = '$2a$12$XX4UDuvqTkT8BRWIc5bG/.f2Ijso/RPeN1DArncHoo1t9/8aaXP56'
 WHERE email = 'admin@sena.edu.co';

UPDATE users
   SET password_hash = '$2a$12$Cbg/M9azmEzX26JhLT844uR95KrIjSBNMFAe9cN9n93gEca7K0Kma'
 WHERE email = 'aprendiz.adso@misena.edu.co';

-- 2. Token de prueba conocido ('token-demo-sesion-06'), guardado como hash
INSERT INTO verification_tokens (user_id, token_hash, expires_at)
SELECT id, encode(digest('token-demo-sesion-06', 'sha256'), 'hex'), NOW() + INTERVAL '24 hours'
  FROM users
 WHERE email = 'aprendiz.adso@misena.edu.co' AND is_verified = FALSE
ON CONFLICT (token_hash) DO NOTHING;

COMMIT;
