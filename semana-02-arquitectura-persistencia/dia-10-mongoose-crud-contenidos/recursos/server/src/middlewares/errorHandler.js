/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Manejo Centralizado de Errores con Formato Estándar de Respuesta
 * Archivo: server/src/middlewares/errorHandler.js  ·  Versión al cierre de la Sesión 10
 * =============================================================================
 */

import { STATUS_CODES } from 'node:http';

/**
 * Error de aplicación con código HTTP y código de negocio.
 * Ejemplo (Sesión 09): throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'El correo ya está registrado.');
 */
export class AppError extends Error {
  constructor(statusCode, code, message, fieldErrors) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Construye SIEMPRE la misma estructura de error para que el frontend la procese igual:
 * { success, statusCode, error, message, code, timestamp, path }
 * El path NO incluye la query string (?email=...), que puede contener datos personales.
 */
export function buildErrorPayload(req, statusCode, code, message, fieldErrors) {
  return {
    success: false,
    statusCode,
    error: STATUS_CODES[statusCode] || 'Error',
    message,
    code,
    ...(fieldErrors ? { fieldErrors } : {}),
    timestamp: new Date().toISOString(),
    path: req.originalUrl.split('?')[0]
  };
}

// 404: ninguna ruta coincidió con la petición
export function notFoundHandler(req, res) {
  res.status(404).json(
    buildErrorPayload(req, 404, 'ROUTE_NOT_FOUND', 'La ruta solicitada no existe en este servidor.')
  );
}

// Traduce los errores de Mongoose (Sesión 10) a errores de la aplicación
function fromMongooseError(err) {
  // Falló una regla del esquema (required, minlength, enum, match...)
  if (err.name === 'ValidationError' && err.errors) {
    const fieldErrors = Object.fromEntries(
      Object.entries(err.errors).map(([field, detail]) => [
        field,
        // Los errores de tipo traen un mensaje técnico en inglés: se reemplaza por uno claro
        detail.name === 'CastError' ? 'El valor no tiene el tipo esperado.' : detail.message
      ])
    );
    return new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', fieldErrors);
  }
  // Un valor no se pudo convertir al tipo del esquema (ej. "abc" en un campo Number)
  if (err.name === 'CastError') {
    return new AppError(400, 'INVALID_VALUE', 'Los datos enviados no son válidos.', {
      [err.path]: 'El valor no tiene el tipo esperado.'
    });
  }
  // Índice único violado (ej. dos servicios con el mismo code)
  if (err.code === 11000) {
    const fieldErrors = Object.fromEntries(
      Object.keys(err.keyValue ?? {}).map((field) => [field, 'Ya existe un registro con este valor.'])
    );
    return new AppError(409, 'DUPLICATE_KEY', 'Ya existe un registro con ese valor único.', fieldErrors);
  }
  return null;
}

// Manejador global: Express lo reconoce porque recibe 4 parámetros (err, req, res, next)
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // JSON malformado enviado por el cliente (lo lanza express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(
      buildErrorPayload(req, 400, 'INVALID_JSON', 'El cuerpo de la petición no es un JSON válido.')
    );
  }

  // Cuerpo más grande que el límite configurado en express.json({ limit })
  if (err.type === 'entity.too.large') {
    return res.status(413).json(
      buildErrorPayload(req, 413, 'PAYLOAD_TOO_LARGE', 'El cuerpo de la petición supera el tamaño permitido.')
    );
  }

  // Errores controlados: los nuestros y los de Mongoose ya traducidos
  const appError = err instanceof AppError ? err : fromMongooseError(err);
  if (appError) {
    return res.status(appError.statusCode).json(
      buildErrorPayload(req, appError.statusCode, appError.code, appError.message, appError.fieldErrors)
    );
  }

  // Error inesperado: el detalle va al log del servidor, NUNCA al cliente
  console.error('🔥 [Unhandled Exception]:', err);
  return res.status(500).json(
    buildErrorPayload(req, 500, 'INTERNAL_ERROR', 'Ocurrió un error inesperado. Intente nuevamente.')
  );
}
