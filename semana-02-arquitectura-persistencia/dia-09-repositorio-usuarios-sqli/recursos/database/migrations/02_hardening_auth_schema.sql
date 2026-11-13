-- ==============================================================================
-- SENA CADPH Garzón · Regional Huila · ADSO
-- Sesión 09 · Hito 0: Migración de endurecimiento del esquema de autenticación
-- Archivo: database/migrations/02_hardening_auth_schema.sql
-- ==============================================================================
-- ¿Por qué una migración y no editar 01_auth_schema.sql?
--   Porque 01 ya se ejecutó en su base de datos (y en la de sus compañeros).
--   Una migración describe el CAMBIO, se ejecuta una sola vez y queda en Git.
--
-- Es IDEMPOTENTE: puede ejecutarse varias veces sin error, y también funciona
-- si su esquema ya tenía la versión corregida de la Sesión 06.
--
-- Ejecución (psql):  \i database/migrations/02_hardening_auth_schema.sql
-- ==============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Tokens: guardar el HASH SHA-256, nunca el token original
-- -----------------------------------------------------------------------------
-- Los tokens existentes estaban en texto plano: se invalidan todos.
DELETE FROM verification_tokens;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'verification_tokens' AND column_name = 'token') THEN
        ALTER TABLE verification_tokens RENAME COLUMN token TO token_hash;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tokens_token') THEN
        ALTER TABLE verification_tokens RENAME CONSTRAINT uq_tokens_token TO uq_tokens_token_hash;
    END IF;
END $$;

ALTER TABLE verification_tokens ALTER COLUMN token_hash TYPE CHAR(64);

-- -----------------------------------------------------------------------------
-- 2. Índices: eliminar duplicados (UNIQUE ya crea su propio índice B-Tree)
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_tokens_token;
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON verification_tokens(user_id);

-- -----------------------------------------------------------------------------
-- 3. Correos siempre en minúsculas
-- -----------------------------------------------------------------------------
-- Si dos cuentas solo difieren en mayúsculas, este UPDATE falla por uq_users_email
-- y TODA la migración se deshace (ROLLBACK): resuelva el duplicado y repita.
UPDATE users SET email = LOWER(email) WHERE email <> LOWER(email);

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_email_lower;
ALTER TABLE users ADD CONSTRAINT chk_users_email_lower CHECK (email = LOWER(email));

-- -----------------------------------------------------------------------------
-- 4. updated_at automático en cada UPDATE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMIT;

-- Verificación:  \d verification_tokens   (columna token_hash character(64))
--                \di                      (5 índices)
