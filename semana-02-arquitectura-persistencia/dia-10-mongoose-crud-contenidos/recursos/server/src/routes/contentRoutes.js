/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Rutas PÚBLICAS del catálogo (consumidas por la Landing Page)
 * Archivo: server/src/routes/contentRoutes.js
 * =============================================================================
 */

import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getPublishedContents } from '../controllers/contentController.js';

const router = Router();

/**
 * @route   GET /api/content/published
 * @access  Público (sin autenticación): solo devuelve contenidos con active: true
 */
router.get('/published', asyncHandler(getPublishedContents));

export default router;
