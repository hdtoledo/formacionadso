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
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// 1. Middlewares Globales de Infraestructura
app.use(cors({
  origin: '*', // En producción se restringe al dominio del Frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// 2. Montaje de Enrutadores Modulares
app.use('/api/health', healthRoutes);

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API RESTful Políglota ADSO - SENA CADPH',
    version: '1.0.0',
    documentation: '/api/docs',
    health_check: '/api/health'
  });
});

// 3. Manejador de Rutas No Encontradas (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `La ruta solicitada [${req.method}] ${req.originalUrl} no existe en este servidor.`
  });
});

// 4. Manejador Global de Excepciones No Controladas (500 Internal Error)
app.use((err, req, res, next) => {
  console.error('🔥 [Unhandled Exception]:', err.stack);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Ocurrió un error inesperado en el servidor.',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
