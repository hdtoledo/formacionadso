-- ==============================================================================
-- SERVICIO NACIONAL DE APRENDIZAJE - SENA
-- CENTRO AGROEMPRESARIAL Y DESARROLLO PECUARIO DEL HUILA (CADPH - GARZÓN)
-- PROGRAMA: TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)
-- SEMANA 02 · SESIÓN 06: BASES DE DATOS RELACIONALES (POSTGRESQL EN PROFUNDIDAD)
-- TALLER DE LABORATORIO: MODELADO RELACIONAL DE USUARIOS Y TOKENS DE VERIFICACIÓN
-- ==============================================================================
--
-- APRENDIZ: __________________________________________________________________
-- FICHA:    __________________________________________________________________
-- FECHA:    __________________________________________________________________
--
-- INSTRUCCIONES:
-- 1. Ejecute este script conectado a su instancia de PostgreSQL (pgAdmin, psql, DBeaver o Neon/Supabase).
-- 2. Complete cada uno de los 5 RETOS progresivos en las secciones marcadas como [TODO].
-- 3. Todos los identificadores primarios DEBEN ser de tipo UUID generados con gen_random_uuid().
-- 4. No altere los nombres de las tablas ni de las columnas para mantener la compatibilidad con el Backend.
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- FASE 0: PREPARACIÓN DE ENTORNO Y EXTENSIONES CRIPTOGRÁFICAS
-- -----------------------------------------------------------------------------
-- PostgreSQL incluye la función nativa gen_random_uuid() desde la versión 13+.
-- Para compatibilidad absoluta habilitamos la extensión pgcrypto si no estuviera activa.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza preventiva SOLO para reiniciar el laboratorio local (CUIDADO: borra datos previos).
-- ¡NUNCA ejecutar estos DROP contra una base de datos de producción!
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- RETO 1: MODELADO DE LA TABLA DE USUARIOS (users)
-- ==============================================================================
-- Especificación de requerimientos:
-- - id: Identificador único universal (UUID), llave primaria por defecto con gen_random_uuid().
-- - email: Dirección de correo electrónico, máximo 150 caracteres, obligatorio (NOT NULL), único (UNIQUE).
--          Debe guardarse SIEMPRE en minúsculas: agregue CHECK (email = LOWER(email)) para que
--          'Ana@Sena.edu.co' y 'ana@sena.edu.co' no puedan ser dos cuentas distintas.
-- - password_hash: Hash de la contraseña generado con bcrypt, obligatorio (NOT NULL), 255 caracteres.
-- - role: Rol del usuario en el sistema. Debe restringirse exclusivamente a 'admin' o 'user' con CHECK.
--         Valor por defecto: 'user'.
-- - is_verified: Bandera booleana de confirmación de email por Resend.
--                Valor por defecto: FALSE, obligatorio (NOT NULL).
-- - created_at: Marca de tiempo de registro con zona horaria (TIMESTAMPTZ), por defecto NOW().
-- - updated_at: Marca de tiempo de última actualización (TIMESTAMPTZ), por defecto NOW().
--               DEFAULT solo actúa en el INSERT: en el TODO 1.1 creará un trigger que la
--               actualice automáticamente en cada UPDATE.

-- [TODO 1]: Escriba la sentencia DDL para crear la tabla 'users'
CREATE TABLE users (
    -- Escriba aquí sus columnas y restricciones...
    
);

-- [TODO 1.1]: Cree la función set_updated_at() y el trigger trg_users_updated_at
-- (BEFORE UPDATE ON users FOR EACH ROW) que asigne NEW.updated_at = NOW().


-- ==============================================================================
-- RETO 2: MODELADO DE LA TABLA DE TOKENS DE VERIFICACIÓN (verification_tokens)
-- ==============================================================================
-- Especificación de requerimientos:
-- - id: UUID llave primaria por defecto gen_random_uuid().
-- - user_id: UUID que referencia a users(id).
--            Restricción de integridad: Si el usuario se elimina, su token DEBE eliminarse en cascada (ON DELETE CASCADE).
--            Obligatorio (NOT NULL).
-- - token_hash: Hash SHA-256 (64 caracteres hexadecimales, CHAR(64)) del token enviado por correo.
--               Obligatorio (NOT NULL), único (UNIQUE).
--               SEGURIDAD: el token original solo viaja en el enlace del correo; en la base
--               de datos se guarda su hash. Si la BD se filtra, los hashes no sirven para
--               activar cuentas ajenas.
-- - expires_at: Fecha y hora exacta de expiración del enlace (TIMESTAMPTZ), obligatorio (NOT NULL).
--               (Por regla de negocio, caduca en 24 horas a partir de su emisión).
-- - created_at: Marca de tiempo con zona horaria (TIMESTAMPTZ), por defecto NOW().

-- [TODO 2]: Escriba la sentencia DDL para crear la tabla 'verification_tokens'
CREATE TABLE verification_tokens (
    -- Escriba aquí sus columnas y restricciones foráneas...

);

-- ==============================================================================
-- RETO 3: CREACIÓN DE ÍNDICES DE RENDIMIENTO (B-TREE)
-- ==============================================================================
-- En producción, el Login y la Verificación por Resend ejecutan búsquedas críticas:
-- 1. Búsqueda por email en login: SELECT * FROM users WHERE email = $1;
-- 2. Búsqueda por token en activación: SELECT * FROM verification_tokens WHERE token_hash = $1;
--
-- PISTA: PRIMARY KEY y UNIQUE ya crean automáticamente un índice B-Tree.
-- Las búsquedas 1 y 2 YA están cubiertas por uq_users_email y uq_tokens_token_hash.
-- Crear otro índice sobre esas columnas sería un duplicado que solo frena las escrituras.

-- [TODO 3.1]: Ejecute \di en psql (o revise "Indexes" en pgAdmin) e identifique los
--             índices que el motor creó solo.

-- [TODO 3.2]: PostgreSQL NO indexa las llaves foráneas automáticamente.
--             Cree el índice en verification_tokens(user_id) para acelerar los JOINs y el borrado en cascada.
-- CREATE INDEX idx_tokens_user_id ON ...

-- Resultado esperado de \di: 5 índices (2 PK + 2 UNIQUE + idx_tokens_user_id)


-- ==============================================================================
-- RETO 4: SIMULACIÓN TRANSACCIONAL DE REGISTRO CON EMISIÓN DE TOKEN
-- ==============================================================================
-- Imagine que un nuevo aprendiz se registra en la plataforma.
-- Utilice una transacción atómica (BEGIN ... COMMIT) para:
-- 1. Insertar el usuario con is_verified = FALSE.
-- 2. Insertar el hash de su token con expires_at fijado a 24 horas en el futuro (NOW() + INTERVAL '24 hours').
--    Use un token de prueba conocido: encode(digest('token-demo-sesion-06', 'sha256'), 'hex')
--    (En la Sesión 11 el backend generará el token real con crypto.randomBytes).
--
-- Use estos hashes bcrypt REALES (cost 12), ya que en la Sesión 14 se iniciará sesión con ellos.
-- ⚠️ Son contraseñas públicas de desarrollo: NUNCA se siembran en producción.
--   Admin2026*    -> $2a$12$XX4UDuvqTkT8BRWIc5bG/.f2Ijso/RPeN1DArncHoo1t9/8aaXP56
--   Aprendiz2026* -> $2a$12$Cbg/M9azmEzX26JhLT844uR95KrIjSBNMFAe9cN9n93gEca7K0Kma
-- 3. También inserte un usuario con rol 'admin' ya verificado (is_verified = TRUE).

-- [TODO 4]: Escriba el bloque de inserciones transaccionales
BEGIN;

-- 4.1 Inserción de Usuario Administrador pre-verificado
-- INSERT INTO users (...) VALUES (...);

-- 4.2 Inserción de Usuario Normal pendiente de confirmación
-- INSERT INTO users (...) VALUES (...);

-- 4.3 Inserción de Token de Verificación para el usuario normal anterior
-- INSERT INTO verification_tokens (...) VALUES (...);

COMMIT;


-- ==============================================================================
-- RETO 5: CONSULTAS DE VALIDACIÓN Y CONTROL DE SEGURIDAD
-- ==============================================================================

-- [TODO 5.1]: Consulta analítica con INNER JOIN:
-- Obtener el email del usuario, su rol, la fecha de expiración del token y cuántas horas le restan
-- antes de expirar (utilice age(expires_at, NOW()) o cálculo con EXTRACT).

-- Escriba su consulta aquí...


-- [TODO 5.2]: Prueba de Integridad Referencial (ON DELETE CASCADE):
-- Elimine al usuario pendiente de verificación creado en el RETO 4.
-- Luego consulte la tabla verification_tokens para demostrar que su token se eliminó automáticamente
-- sin dejar registros huérfanos.

-- Escriba su prueba de eliminación aquí...


-- ==============================================================================
-- PREGUNTAS DE SUSTENTACIÓN EN VIVO (MODIFICACIÓN EN CALIENTE):
-- ==============================================================================
-- 1. ¿Por qué usamos TIMESTAMPTZ en lugar de TIMESTAMP simple en un sistema con usuarios remotos?
-- 2. ¿Qué ocurre si un usuario intenta registrarse dos veces con el mismo correo? ¿Qué constraint responde?
--    ¿Y si lo intenta con el mismo correo escrito en MAYÚSCULAS?
-- 3. ¿Cómo agregaría un campo 'last_login' a la tabla users mediante ALTER TABLE sin perder los datos existentes?
-- ==============================================================================
