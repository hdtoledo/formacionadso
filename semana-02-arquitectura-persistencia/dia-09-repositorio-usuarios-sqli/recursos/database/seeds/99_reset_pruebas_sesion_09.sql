-- ==============================================================================
-- SENA CADPH Garzón · Regional Huila · ADSO
-- Sesión 09 · Reinicio de datos para repetir la colección Bruno
-- Archivo: database/seeds/99_reset_pruebas_sesion_09.sql
-- ==============================================================================
-- ⚠️ SOLO DESARROLLO LOCAL: borra los usuarios creados por las pruebas.
-- Ejecución (psql):  \i database/seeds/99_reset_pruebas_sesion_09.sql
-- ==============================================================================

BEGIN;

-- 1. Usuarios creados por las peticiones 02 y 04 de Bruno (sus tokens caen por CASCADE)
DELETE FROM users
 WHERE email IN ('nuevo.aprendiz@misena.edu.co', 'intento.admin@misena.edu.co');

-- 2. El aprendiz de la semilla vuelve a quedar pendiente de verificación
UPDATE users SET is_verified = FALSE WHERE email = 'aprendiz.adso@misena.edu.co';

-- 3. Token demo de nuevo vigente (hash SHA-256 de 'token-demo-sesion-06')
INSERT INTO verification_tokens (user_id, token_hash, expires_at)
SELECT id, encode(digest('token-demo-sesion-06', 'sha256'), 'hex'), NOW() + INTERVAL '24 hours'
  FROM users
 WHERE email = 'aprendiz.adso@misena.edu.co'
ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at;

COMMIT;
