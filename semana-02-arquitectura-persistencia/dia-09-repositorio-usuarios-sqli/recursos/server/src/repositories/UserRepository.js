/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Patrón Repositorio: acceso a datos de usuarios en PostgreSQL
 * Archivo: server/src/repositories/UserRepository.js
 * =============================================================================
 *
 * REGLAS DE ORO DE ESTE ARCHIVO
 * 1. Todo valor externo viaja como parámetro ($1, $2...), NUNCA concatenado en el SQL.
 * 2. password_hash nunca sale de aquí hacia el cliente: solo se seleccionan columnas públicas.
 * 3. Los errores del motor (códigos 23505, etc.) se traducen a errores de la aplicación.
 */

import { pool } from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';

// Código de PostgreSQL para violación de restricción UNIQUE
const PG_UNIQUE_VIOLATION = '23505';

// El correo se guarda siempre en minúsculas (lo exige chk_users_email_lower de la Sesión 06)
const normalizeEmail = (email) => email.trim().toLowerCase();

/**
 * Crea un usuario y devuelve sus datos públicos (incluido el UUID generado por PostgreSQL).
 */
async function createUser({ email, passwordHash, role = 'user' }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, is_verified, created_at, updated_at`,
      [normalizeEmail(email), passwordHash, role]
    );
    return rows[0];
  } catch (err) {
    if (err.code === PG_UNIQUE_VIOLATION && err.constraint === 'uq_users_email') {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'El correo ya está registrado.');
    }
    throw err; // Cualquier otro error lo maneja el errorHandler global (500)
  }
}

/**
 * Busca un usuario por correo. Devuelve null si no existe.
 */
async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, role, is_verified, created_at, updated_at
       FROM users
      WHERE email = $1
      LIMIT 1`,
    [normalizeEmail(email)]
  );
  return rows[0] ?? null;
}

/**
 * Busca un usuario por su UUID. Devuelve null si no existe.
 */
async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, email, role, is_verified, created_at, updated_at
       FROM users
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Activa la cuenta y elimina sus tokens de verificación en UNA transacción.
 * Devuelve el usuario activado, o null si no existe o ya estaba verificado.
 *
 * ⚠️ Una transacción necesita UN MISMO cliente: pool.query('BEGIN') no sirve,
 *    porque cada pool.query puede ejecutarse en una conexión distinta del pool.
 */
async function verifyUser(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE users
          SET is_verified = TRUE
        WHERE id = $1 AND is_verified = FALSE
        RETURNING id, email, role, is_verified, created_at, updated_at`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Tokens de un solo uso: al activar la cuenta ya no deben servir más
    await client.query('DELETE FROM verification_tokens WHERE user_id = $1', [id]);

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {}); // Si falla algo, se deshace TODO
    throw err;
  } finally {
    client.release(); // Devolver SIEMPRE la conexión al pool (si no, el pool se agota)
  }
}

export const UserRepository = { createUser, findByEmail, findById, verifyUser };
