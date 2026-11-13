/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Rutas de laboratorio del UserRepository (SOLO DESARROLLO)
 * Archivo: server/src/routes/devUserRoutes.js
 * =============================================================================
 */

import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createDevUser,
  getDevUserByEmail,
  getDevUserById,
  verifyDevUser
} from '../controllers/devUserController.js';

const router = Router();

// El orden importa: /by-email debe ir ANTES de /:id, o Express tomaría "by-email" como un id
router.post('/', asyncHandler(createDevUser));
router.get('/by-email', asyncHandler(getDevUserByEmail));
router.get('/:id', asyncHandler(getDevUserById));
router.patch('/:id/verify', asyncHandler(verifyDevUser));

export default router;
