/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Configuración de la Aplicación Express (Pipeline de Middlewares)
 * Archivo: server/src/app.js
 * =============================================================================
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/environment.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 0. No anunciar la tecnología del servidor (cabecera X-Powered-By: Express)
app.disable('x-powered-by');

// 1. Middlewares Globales de Infraestructura
// CORS: solo el frontend autorizado (CLIENT_URL) puede consumir la API desde el navegador.
// credentials: true es obligatorio para las cookies httpOnly de la Semana 3.
// NUNCA usar origin: '*' con credenciales: el navegador lo rechaza y es inseguro.
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

app.use(express.json({ limit: '100kb' })); // Límite explícito del tamaño del body
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// 2. Montaje de Enrutadores Modulares
app.use('/api/health', healthRoutes);

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
