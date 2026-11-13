-- ==============================================================================
-- SERVICIO NACIONAL DE APRENDIZAJE - SENA
-- CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (CADPH - GARZÓN)
-- PROGRAMA: TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
-- REFERENCIA DOCENTE OFICIAL · SEMANA 02 · SESIÓN 06 (POSTGRESQL RELACIONAL)
-- SCRIPT DE REFERENCIA COMPLETO Y VALIDADO EN POSTGRESQL 14 / 15 / 16 / 18 / NEON
-- ==============================================================================
-- INSTRUCTOR: Ing. Hector David Toledo Garcia (hdtoledo.dev)
--
-- En el repositorio del aprendiz este script se divide en dos archivos:
--   database/migrations/01_auth_schema.sql  -> Secciones 0 a 3 (estructura)
--   database/seeds/01_test_seed.sql         -> Secciones 4 y 5 (datos de prueba)
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 0. HABILITAR EXTENSIONES CRIPTOGRÁFICAS
-- -----------------------------------------------------------------------------
-- gen_random_uuid() es nativa desde PostgreSQL 13; pgcrypto aporta digest() y
-- gen_random_bytes(), que usamos en la semilla para simular tokens.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza preventiva SOLO para el laboratorio local.
-- ¡NUNCA ejecutar estos DROP contra una base de datos de producción!
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- RETO 1: MODELADO DE LA TABLA DE USUARIOS (users)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Restricciones de integridad y dominio
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_lower CHECK (email = LOWER(email)),
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'user'))
);

COMMENT ON TABLE users IS 'Almacén de identidades de usuarios del sistema con roles y estado de activación';
COMMENT ON COLUMN users.id IS 'Identificador universal único UUID v4 (no enumerable)';
COMMENT ON COLUMN users.email IS 'Correo normalizado en minúsculas: Ana@Sena.edu.co y ana@sena.edu.co son la misma cuenta';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt (60 caracteres). La contraseña en texto plano NUNCA se almacena';
COMMENT ON COLUMN users.is_verified IS 'Bandera de confirmación de email activada por el enlace enviado con Resend';

-- -----------------------------------------------------------------------------
-- RETO 1.1: updated_at AUTOMÁTICO CON TRIGGER
-- -----------------------------------------------------------------------------
-- DEFAULT NOW() solo actúa en el INSERT. Para que updated_at cambie en cada
-- UPDATE, el motor ejecuta esta función antes de guardar la fila modificada.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- RETO 2: MODELADO DE LA TABLA DE TOKENS DE VERIFICACIÓN (verification_tokens)
-- -----------------------------------------------------------------------------
-- SEGURIDAD: guardamos el HASH SHA-256 del token, nunca el token original.
-- El token original solo viaja en el enlace del correo. Si alguien roba una copia
-- de la base de datos, no puede usar los hashes para activar cuentas ajenas.
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Restricción foránea estricta con eliminación en cascada
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Unicidad del hash del token
    CONSTRAINT uq_tokens_token_hash UNIQUE (token_hash)
);

COMMENT ON TABLE verification_tokens IS 'Tokens temporales de un solo uso para activación de cuenta vía correo';
COMMENT ON COLUMN verification_tokens.token_hash IS 'SHA-256 en hexadecimal (64 caracteres) del token enviado por correo';

-- -----------------------------------------------------------------------------
-- RETO 3: ÍNDICES DE RENDIMIENTO (B-TREE)
-- -----------------------------------------------------------------------------
-- IMPORTANTE: PRIMARY KEY y UNIQUE ya crean automáticamente un índice B-Tree.
--   users_pkey, uq_users_email, verification_tokens_pkey, uq_tokens_token_hash
-- Crear otro índice sobre email o token_hash sería un DUPLICADO que solo hace
-- más lentas las escrituras.
--
-- Lo que PostgreSQL NO indexa por sí solo es la llave foránea (user_id).
-- Ese índice acelera los JOIN y el borrado en cascada:
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON verification_tokens(user_id);

-- Verificación en psql:  \di
-- Resultado esperado: 5 índices (2 PK + 2 UNIQUE + idx_tokens_user_id)

-- -----------------------------------------------------------------------------
-- RETO 4: SIMULACIÓN TRANSACCIONAL DE REGISTRO CON EMISIÓN DE TOKEN
-- -----------------------------------------------------------------------------
-- ⚠️ Datos SOLO para desarrollo local. Estas cuentas y contraseñas son públicas
-- (están en GitHub): NUNCA se siembran en la base de datos de producción.
BEGIN;

-- 4.1 Administrador del sistema (ya verificado)
-- Hash bcrypt real (cost 12) de la contraseña de desarrollo: Admin2026*
INSERT INTO users (id, email, password_hash, role, is_verified)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@sena.edu.co',
    '$2a$12$XX4UDuvqTkT8BRWIc5bG/.f2Ijso/RPeN1DArncHoo1t9/8aaXP56',
    'admin',
    TRUE
);

-- 4.2 Aprendiz pendiente de verificación
-- Hash bcrypt real (cost 12) de la contraseña de desarrollo: Aprendiz2026*
INSERT INTO users (id, email, password_hash, role, is_verified)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'aprendiz.adso@misena.edu.co',
    '$2a$12$Cbg/M9azmEzX26JhLT844uR95KrIjSBNMFAe9cN9n93gEca7K0Kma',
    'user',
    FALSE
);

-- 4.3 Token con expiración a 24 horas.
-- En la Sesión 11 el backend genera el token con crypto.randomBytes(32), lo envía
-- por correo y guarda solo su SHA-256. Aquí simulamos un token conocido
-- ('token-demo-sesion-06') para poder probar la verificación en la consulta 5.2.
INSERT INTO verification_tokens (user_id, token_hash, expires_at)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    encode(digest('token-demo-sesion-06', 'sha256'), 'hex'),
    NOW() + INTERVAL '24 hours'
);

COMMIT;

-- -----------------------------------------------------------------------------
-- RETO 5: CONSULTAS DE VALIDACIÓN Y CONTROL DE SEGURIDAD
-- -----------------------------------------------------------------------------

-- 5.1 Consulta analítica relacional: usuarios pendientes y horas restantes del token
SELECT
    u.id AS user_id,
    u.email,
    u.role,
    u.is_verified,
    t.expires_at,
    ROUND(EXTRACT(EPOCH FROM (t.expires_at - NOW())) / 3600, 2) AS hours_remaining
FROM users u
INNER JOIN verification_tokens t ON u.id = t.user_id
WHERE u.is_verified = FALSE;

-- 5.2 Vista previa del endpoint de activación (Sesión 13):
-- El usuario llega con el token ORIGINAL del enlace; se calcula su hash y se busca.
-- Solo es válido si existe y NO ha expirado.
SELECT
    u.id,
    u.email,
    u.is_verified
FROM verification_tokens t
INNER JOIN users u ON t.user_id = u.id
WHERE t.token_hash = encode(digest('token-demo-sesion-06', 'sha256'), 'hex')
  AND t.expires_at > NOW();
-- Resultado esperado: 1 fila (aprendiz.adso@misena.edu.co)

-- 5.3 Prueba del trigger updated_at:
-- UPDATE users SET role = 'user' WHERE email = 'admin@sena.edu.co';
-- SELECT email, created_at, updated_at FROM users;  -- updated_at > created_at

-- 5.4 Prueba de la restricción de minúsculas (debe FALLAR):
-- INSERT INTO users (email, password_hash) VALUES ('Admin@Sena.edu.co', 'x');
-- ERROR: new row for relation "users" violates check constraint "chk_users_email_lower"

-- 5.5 Demostración de Integridad Referencial (ON DELETE CASCADE):
-- DELETE FROM users WHERE id = 'b0000000-0000-0000-0000-000000000002';
-- SELECT COUNT(*) FROM verification_tokens WHERE user_id = 'b0000000-0000-0000-0000-000000000002';
-- (Resultado esperado: 0 filas)

-- -----------------------------------------------------------------------------
-- SOLUCIÓN A PREGUNTAS DE SUSTENTACIÓN EN VIVO (MODIFICACIÓN EN CALIENTE):
-- -----------------------------------------------------------------------------
-- 1. ¿Por qué TIMESTAMPTZ? Porque almacena la fecha internamente en UTC y la convierte
--    a la zona horaria del cliente (ej. America/Bogota GMT-5), evitando desfases
--    críticos al validar la expiración de tokens si el servidor está en la nube.
--
-- 2. ¿Qué ocurre al duplicar correo? El motor aborta con:
--    ERROR: duplicate key value violates unique constraint "uq_users_email"
--    (código 23505, que el backend traducirá a HTTP 409 Conflict en la Sesión 09).
--
-- 3. ¿Por qué guardar token_hash y no el token? Si la base de datos se filtra,
--    el atacante solo obtiene hashes SHA-256 que no sirven para activar cuentas.
--
-- 4. Modificación en caliente (Live Mod para el aprendiz):
--    ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ NULL;
-- -----------------------------------------------------------------------------
