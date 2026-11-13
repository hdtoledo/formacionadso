/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Validadores de entrada reutilizables
 * Archivo: server/src/utils/validators.js  ·  Versión al cierre de la Sesión 10
 * =============================================================================
 *
 * Validamos en el servidor ANTES de llegar a la base de datos. En la Semana 7
 * estos validadores se reemplazan por esquemas Zod.
 */

import { AppError } from '../middlewares/errorHandler.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;

// Texto, máximo 150 caracteres (VARCHAR(150) de la tabla users) y formato de correo
export const isValidEmail = (value) =>
  typeof value === 'string' && value.trim().length <= 150 && EMAIL_REGEX.test(value.trim());

// Un id inválido se rechaza con 400 aquí; si llegara a PostgreSQL provocaría el error 22P02 (500)
export const isUuid = (value) => typeof value === 'string' && UUID_REGEX.test(value);

// ObjectId de MongoDB: exactamente 24 caracteres hexadecimales.
// (mongoose.isValidObjectId también acepta cualquier texto de 12 caracteres, por eso usamos regex)
export const isObjectId = (value) => typeof value === 'string' && OBJECT_ID_REGEX.test(value);

/**
 * Límite de resultados para listados: entero entre 1 y max.
 * Ningún listado devuelve la colección completa: sin tope, una petición podría traer millones de documentos.
 */
export function parseLimit(value, { defaultLimit = 20, max = 50 } = {}) {
  if (value === undefined) return defaultLimit;
  const limit = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isInteger(limit) || limit < 1 || limit > max) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', {
      limit: `Debe ser un número entero entre 1 y ${max}.`
    });
  }
  return limit;
}
