/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Rutas de laboratorio del CRUD de contenidos (SOLO DESARROLLO)
 * Archivo: server/src/routes/devContentRoutes.js
 * =============================================================================
 *
 * En la Semana 3 estas operaciones pasan a /api/content protegidas con
 * verifyAuth + requireRole('admin'). Hasta entonces, app.js NO las monta en producción.
 */

import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listContents,
  createContent,
  updateContent,
  deleteContent
} from '../controllers/contentController.js';

const router = Router();

router.get('/', asyncHandler(listContents));
router.post('/', asyncHandler(createContent));
router.patch('/:id', asyncHandler(updateContent));
router.delete('/:id', asyncHandler(deleteContent));

export default router;
