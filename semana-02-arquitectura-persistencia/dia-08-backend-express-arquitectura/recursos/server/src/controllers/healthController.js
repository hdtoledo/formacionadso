/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Controlador de Salud del Sistema (Health Check Dual)
 * Archivo: server/src/controllers/healthController.js
 * =============================================================================
 */

import { pool, mongoose } from '../config/db.js';

/**
 * Mapeo semántico del estado de conexión de Mongoose
 */
const MONGO_STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

/**
 * GET /api/health
 * Evalúa la salud en tiempo real de la API Express, el Pool de PostgreSQL
 * y la conexión con MongoDB Atlas, midiendo latencias de ida y vuelta (RTT).
 */
export async function getHealthStatus(req, res) {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  const services = {
    api: {
      status: 'up',
      uptime_seconds: uptimeSeconds,
      node_version: process.version,
      memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    postgres: {
      status: 'down',
      latency_ms: null,
      error: null,
      pool_stats: {
        total_count: pool.totalCount,
        idle_count: pool.idleCount,
        waiting_count: pool.waitingCount
      }
    },
    mongodb: {
      status: 'down',
      connection_state: MONGO_STATE_LABELS[mongoose.connection.readyState] || 'unknown',
      latency_ms: null,
      error: null
    }
  };

  // 1. Evaluar PostgreSQL Pool
  const pgStart = Date.now();
  try {
    const pgRes = await pool.query('SELECT NOW() AS server_time, version() AS version');
    services.postgres.latency_ms = Date.now() - pgStart;
    services.postgres.status = 'healthy';
    services.postgres.server_time = pgRes.rows[0].server_time;
  } catch (err) {
    services.postgres.latency_ms = Date.now() - pgStart;
    services.postgres.status = 'unhealthy';
    services.postgres.error = err.message;
  }

  // 2. Evaluar MongoDB Atlas
  const mongoStart = Date.now();
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      services.mongodb.latency_ms = Date.now() - mongoStart;
      services.mongodb.status = 'healthy';
    } else {
      services.mongodb.latency_ms = Date.now() - mongoStart;
      services.mongodb.status = 'unhealthy';
      services.mongodb.error = `Estado de conexión no listo: ${services.mongodb.connection_state}`;
    }
  } catch (err) {
    services.mongodb.latency_ms = Date.now() - mongoStart;
    services.mongodb.status = 'unhealthy';
    services.mongodb.error = err.message;
  }

  // Determinar Estado Global del Sistema
  const isHealthy = services.postgres.status === 'healthy' && services.mongodb.status === 'healthy';
  const isPartiallyHealthy = services.postgres.status === 'healthy' || services.mongodb.status === 'healthy';

  const globalStatus = isHealthy ? 'healthy' : isPartiallyHealthy ? 'degraded' : 'unhealthy';
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: globalStatus,
    timestamp,
    environment: process.env.NODE_ENV || 'development',
    services
  });
}
