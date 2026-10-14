-- ==============================================================================
-- SERVICIO NACIONAL DE APRENDIZAJE - SENA
-- CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (CADPH - GARZÓN)
-- PROGRAMA: TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
-- REFERENCIA DOCENTE OFICIAL · SEMANA 02 · SESIÓN 06 (POSTGRESQL RELACIONAL)
-- SCRIPT DE REFERENCIA COMPLETO Y VALIDADO EN POSTGRESQL 14 / 15 / 16 / NEON
-- ==============================================================================
-- INSTRUCTOR: Ing. Hector David Toledo Garcia (hdtoledo.dev)
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 0. HABILITAR EXTENSIONES CRIPTOGRÁFICAS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza preventiva controlada
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
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'user'))
);

COMMENT ON TABLE users IS 'Almacén de identidades de usuarios del sistema con roles y estado de activación';
COMMENT ON COLUMN users.id IS 'Identificador universal único UUID v4';
COMMENT ON COLUMN users.is_verified IS 'Bandera de confirmación de email activada por Resend';

-- -----------------------------------------------------------------------------
-- RETO 2: MODELADO DE LA TABLA DE TOKENS DE VERIFICACIÓN (verification_tokens)
-- -----------------------------------------------------------------------------
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Restricción foránea estricta con eliminación en cascada
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
        
    -- Restricción de unicidad del token
    CONSTRAINT uq_tokens_token UNIQUE (token)
);

COMMENT ON TABLE verification_tokens IS 'Tokens temporales criptográficos emitidos para activación de cuenta vía correo';

-- -----------------------------------------------------------------------------
-- RETO 3: CREACIÓN DE ÍNDICES DE RENDIMIENTO (B-TREE)
-- -----------------------------------------------------------------------------
-- Índices para búsquedas de alta concurrencia en Login y Verificación
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON verification_tokens(user_id);

-- -----------------------------------------------------------------------------
-- RETO 4: SIMULACIÓN TRANSACCIONAL DE REGISTRO CON EMISIÓN DE TOKEN
-- -----------------------------------------------------------------------------
BEGIN;

-- 4.1 Inserción de Administrador del Sistema (Ya verificado)
-- Hash simulado de contraseña 'Admin2026*' generado con bcrypt
INSERT INTO users (id, email, password_hash, role, is_verified) 
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@sena.edu.co',
    '$2a$12$e8Y5t1hP9Kk8a0mZb5N4.uQ9P0kX2Y8w1o7q1l3p5r7t9v1x3z5b7',
    'admin',
    TRUE
);

-- 4.2 Inserción de Usuario Aprendiz Normal (Pendiente de verificación)
-- Hash simulado de contraseña 'Aprendiz2026*'
INSERT INTO users (id, email, password_hash, role, is_verified) 
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'aprendiz.adso@misena.edu.co',
    '$2a$12$k9L2m4n6p8q0r2t4v6x8.z0a2c4e6g8i0k2m4n6p8q0r2t4v6x8z0',
    'user',
    FALSE
);

-- 4.3 Inserción de Token Criptográfico con expiración a 24 horas
INSERT INTO verification_tokens (user_id, token, expires_at)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    encode(gen_random_bytes(32), 'hex'), -- Genera un token hex seguro de 64 caracteres
    NOW() + INTERVAL '24 hours'
);

COMMIT;

-- -----------------------------------------------------------------------------
-- RETO 5: CONSULTAS DE VALIDACIÓN Y CONTROL DE SEGURIDAD
-- -----------------------------------------------------------------------------

-- 5.1 Consulta analítica relacional: Usuarios pendientes y tiempo restante del token
SELECT 
    u.id AS user_id,
    u.email,
    u.role,
    u.is_verified,
    t.token AS verification_token,
    t.expires_at,
    NOW() AS current_time,
    ROUND(EXTRACT(EPOCH FROM (t.expires_at - NOW())) / 3600, 2) AS hours_remaining
FROM users u
INNER JOIN verification_tokens t ON u.id = t.user_id
WHERE u.is_verified = FALSE;

-- 5.2 Consulta de verificación de token en el Endpoint de Activación (Sesión 13 Preview):
-- Valida si un token recibido existe y NO ha expirado
SELECT 
    u.id, 
    u.email, 
    u.is_verified, 
    t.expires_at > NOW() AS is_token_valid
FROM verification_tokens t
INNER JOIN users u ON t.user_id = u.id
WHERE t.token = (SELECT token FROM verification_tokens LIMIT 1);

-- 5.3 Demostración de Integridad Referencial (ON DELETE CASCADE):
-- Si eliminamos un usuario, sus tokens en verification_tokens deben eliminarse automáticamente
-- sin lanzar excepción de Foreign Key Violation:
--
-- DELETE FROM users WHERE id = 'b0000000-0000-0000-0000-000000000002';
-- SELECT COUNT(*) FROM verification_tokens WHERE user_id = 'b0000000-0000-0000-0000-000000000002';
-- (Resultado esperado: 0 filas)

-- -----------------------------------------------------------------------------
-- SOLUCIÓN A PREGUNTAS DE SUSTENTACIÓN EN VIVO (MODIFICACIÓN EN CALIENTE):
-- -----------------------------------------------------------------------------
-- 1. ¿Por qué TIMESTAMPTZ? Porque almacena la fecha internamente en UTC y la convierte
--    a la zona horaria del cliente (ej. America/Bogota GMT-5), evitando desfases
--    críticos al validar la expiración de tokens si el servidor está en la nube (AWS us-east-1).
--
-- 2. ¿Qué ocurre al duplicar correo? El motor aborta con:
--    ERROR: duplicate key value violates unique constraint "uq_users_email"
--
-- 3. Modificación en caliente (Live Mod para el aprendiz):
--    ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ NULL;
-- -----------------------------------------------------------------------------
