/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Configuración de la Aplicación Express (Pipeline de Middlewares)
 * Archivo: server/src/app.js  ·  Versión al cierre de la Sesión 10
 * =============================================================================
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/environment.js';
import healthRoutes from './routes/healthRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import devUserRoutes from './routes/devUserRoutes.js';
import devContentRoutes from './routes/devContentRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 0. No anunciar la tecnología del servidor (cabecera X-Powered-By: Express)
app.disable('x-powered-by');

// 1. Middlewares Globales de Infraestructura
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

app.use(express.json({ limit: '100kb' }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// 2. Montaje de Enrutadores Modulares
app.use('/api/health', healthRoutes);
app.use('/api/content', contentRoutes); // Público: alimenta la Landing Page

// Rutas de laboratorio (Sesiones 09 y 10): todavía NO tienen autenticación
// (llega en la Semana 3), por eso jamás se montan en producción.
if (!config.isProduction) {
  app.use('/api/dev/users', devUserRoutes);
  app.use('/api/dev/content', devContentRoutes);
}

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API RESTful Políglota ADSO - SENA CADPH',
    version: '1.0.0',
    health_check: '/api/health'
  });
});

// 3. Ruta no encontrada (404) y 4. Manejador global de errores (SIEMPRE al final)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
