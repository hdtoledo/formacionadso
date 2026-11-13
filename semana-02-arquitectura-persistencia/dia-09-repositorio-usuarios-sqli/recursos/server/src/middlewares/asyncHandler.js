/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Envoltorio para controladores async
 * Archivo: server/src/middlewares/asyncHandler.js
 * =============================================================================
 *
 * Express 4 NO captura los errores de funciones async: si un await falla, la
 * promesa rechazada queda suelta y la petición nunca responde. Este envoltorio
 * envía cualquier error a next(), es decir, al errorHandler global.
 */

export const asyncHandler = (controller) => (req, res, next) =>
  Promise.resolve(controller(req, res, next)).catch(next);
