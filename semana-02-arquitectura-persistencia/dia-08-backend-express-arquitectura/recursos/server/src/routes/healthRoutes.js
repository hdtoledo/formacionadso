/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Rutas de Monitoreo y Diagnóstico (Health Check)
 * Archivo: server/src/routes/healthRoutes.js
 * =============================================================================
 */

import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Retorna el estado de operatividad de la API y de ambas bases de datos
 * @access  Público / Monitoreo
 */
router.get('/', getHealthStatus);

export default router;

