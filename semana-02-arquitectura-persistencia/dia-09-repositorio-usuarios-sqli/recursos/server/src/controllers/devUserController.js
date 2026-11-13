/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Controlador de laboratorio para probar el UserRepository (SOLO DESARROLLO)
 * Archivo: server/src/controllers/devUserController.js
 * =============================================================================
 *
 * Estas rutas existen para probar el repositorio con Bruno antes de tener
 * autenticación. En la Semana 3 se reemplazan por /api/auth (registro, login)
 * protegido con JWT y roles. app.js NUNCA las monta en producción.
 */

import { UserRepository } from '../repositories/UserRepository.js';
import { AppError } from '../middlewares/errorHandler.js';
import { isValidEmail, isUuid } from '../utils/validators.js';

// Marcador que NO es un hash bcrypt válido: con él nadie puede iniciar sesión.
// La contraseña real (bcrypt) llega en la Sesión 11.
const DEV_PLACEHOLDER_HASH = '!sin-password-sesion-09';

const invalidEmail = () =>
  new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', {
    email: 'Debe ser un correo válido de máximo 150 caracteres.'
  });

const invalidId = () =>
  new AppError(400, 'INVALID_ID', 'El identificador debe ser un UUID válido.');

const userNotFound = () =>
  new AppError(404, 'USER_NOT_FOUND', 'El usuario solicitado no existe.');

// POST /api/dev/users   Body: { "email": "..." }
export async function createDevUser(req, res) {
  const { email } = req.body ?? {};
  if (!isValidEmail(email)) throw invalidEmail();

  // El rol NO se toma del body: si lo hiciéramos, cualquiera podría enviar
  // { "role": "admin" } y auto-ascenderse (vulnerabilidad de asignación masiva).
  const user = await UserRepository.createUser({ email, passwordHash: DEV_PLACEHOLDER_HASH });

  res.status(201).json({ success: true, data: user });
}

// GET /api/dev/users/by-email?email=...
export async function getDevUserByEmail(req, res) {
  const { email } = req.query;
  if (!isValidEmail(email)) throw invalidEmail();

  const user = await UserRepository.findByEmail(email);
  if (!user) throw userNotFound();

  res.json({ success: true, data: user });
}

// GET /api/dev/users/:id
export async function getDevUserById(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) throw invalidId();

  const user = await UserRepository.findById(id);
  if (!user) throw userNotFound();

  res.json({ success: true, data: user });
}

// PATCH /api/dev/users/:id/verify
export async function verifyDevUser(req, res) {
  const { id } = req.params;
  if (!isUuid(id)) throw invalidId();

  const user = await UserRepository.verifyUser(id);
  if (!user) {
    // verifyUser devuelve null en dos casos: averiguamos cuál para responder bien
    const existing = await UserRepository.findById(id);
    if (!existing) throw userNotFound();
    throw new AppError(409, 'USER_ALREADY_VERIFIED', 'La cuenta ya estaba verificada.');
  }

  res.json({ success: true, data: user });
}
