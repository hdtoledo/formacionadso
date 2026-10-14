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

-- Limpieza preventiva para reiniciar el laboratorio (CUIDADO: Borra datos previos)
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- RETO 1: MODELADO DE LA TABLA DE USUARIOS (users)
-- ==============================================================================
-- Especificación de requerimientos:
-- - id: Identificador único universal (UUID), llave primaria por defecto con gen_random_uuid().
-- - email: Dirección de correo electrónico, máximo 150 caracteres, obligatorio (NOT NULL), único (UNIQUE).
-- - password_hash: Hash de la contraseña generado con bcrypt, obligatorio (NOT NULL), 255 caracteres.
-- - role: Rol del usuario en el sistema. Debe restringirse exclusivamente a 'admin' o 'user' con CHECK.
--         Valor por defecto: 'user'.
-- - is_verified: Bandera booleana de confirmación de email por Resend.
--                Valor por defecto: FALSE, obligatorio (NOT NULL).
-- - created_at: Marca de tiempo de registro con zona horaria (TIMESTAMPTZ), por defecto NOW().
-- - updated_at: Marca de tiempo de última actualización (TIMESTAMPTZ), por defecto NOW().

-- [TODO 1]: Escriba la sentencia DDL para crear la tabla 'users'
CREATE TABLE users (
    -- Escriba aquí sus columnas y restricciones...
    
);

-- ==============================================================================
-- RETO 2: MODELADO DE LA TABLA DE TOKENS DE VERIFICACIÓN (verification_tokens)
-- ==============================================================================
-- Especificación de requerimientos:
-- - id: UUID llave primaria por defecto gen_random_uuid().
-- - user_id: UUID que referencia a users(id).
--            Restricción de integridad: Si el usuario se elimina, su token DEBE eliminarse en cascada (ON DELETE CASCADE).
--            Obligatorio (NOT NULL).
-- - token: Cadena criptográfica única de 64 caracteres generada para la URL de confirmación.
--          Obligatorio (NOT NULL), único (UNIQUE).
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
-- 2. Búsqueda por token en activación: SELECT * FROM verification_tokens WHERE token = $1;
-- Cree los índices necesarios para asegurar búsquedas O(log n) sin escaneos secuenciales.

-- [TODO 3.1]: Crear índice único en users(email)
-- CREATE UNIQUE INDEX idx_users_email ON ...

-- [TODO 3.2]: Crear índice único en verification_tokens(token)
-- CREATE UNIQUE INDEX idx_tokens_token ON ...

-- [TODO 3.3]: Crear índice en verification_tokens(user_id) para acelerar los JOINs y borrados en cascada
-- CREATE INDEX idx_tokens_user_id ON ...


-- ==============================================================================
-- RETO 4: SIMULACIÓN TRANSACCIONAL DE REGISTRO CON EMISIÓN DE TOKEN
-- ==============================================================================
-- Imagine que un nuevo aprendiz se registra en la plataforma.
-- Utilice una transacción atómica (BEGIN ... COMMIT) para:
-- 1. Insertar el usuario con is_verified = FALSE.
-- 2. Insertar su token temporal con expires_at fijado a 24 horas en el futuro (NOW() + INTERVAL '24 hours').
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
-- Obtener el email del usuario, su rol, el token de verificación y cuántas horas le restan
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
-- 3. ¿Cómo agregaría un campo 'last_login' a la tabla users mediante ALTER TABLE sin perder los datos existentes?
-- ==============================================================================
