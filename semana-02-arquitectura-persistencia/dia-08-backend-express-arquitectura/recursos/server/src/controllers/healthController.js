/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Controlador de Salud del Sistema (Health Check Dual)
 * Archivo: server/src/controllers/healthController.js
 * =============================================================================
 */

import { pool, mongoose } from '../config/db.js';
import { config } from '../config/environment.js';

// Mapeo semántico del estado de conexión de Mongoose (readyState)
const MONGO_STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

// Seguridad: el detalle técnico del error solo se muestra en desarrollo.
// En producción un atacante no debe conocer versiones, hosts ni mensajes internos.
const publicError = (err) => (config.isProduction ? 'unavailable' : err.message);

async function checkPostgres() {
  const start = Date.now();
  try {
    await pool.query('SELECT NOW()');
    return {
      status: 'healthy',
      latency_ms: Date.now() - start,
      pool_stats: {
        total_count: pool.totalCount,
        idle_count: pool.idleCount,
        waiting_count: pool.waitingCount
      }
    };
  } catch (err) {
    return { status: 'unhealthy', latency_ms: Date.now() - start, error: publicError(err) };
  }
}

async function checkMongo() {
  const start = Date.now();
  const connectionState = MONGO_STATE_LABELS[mongoose.connection.readyState] || 'unknown';

  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return { status: 'unhealthy', connection_state: connectionState, latency_ms: null, error: `Estado de conexión: ${connectionState}` };
  }

  try {
    await mongoose.connection.db.admin().ping();
    return { status: 'healthy', connection_state: connectionState, latency_ms: Date.now() - start };
  } catch (err) {
    return { status: 'unhealthy', connection_state: connectionState, latency_ms: Date.now() - start, error: publicError(err) };
  }
}

/**
 * GET /api/health
 * Evalúa en paralelo (Promise.all) la salud del Pool de PostgreSQL y de MongoDB Atlas,
 * midiendo la latencia de ida y vuelta (RTT) de cada motor.
 */
export async function getHealthStatus(req, res) {
  const [postgres, mongodb] = await Promise.all([checkPostgres(), checkMongo()]);

  const healthyCount = [postgres, mongodb].filter((s) => s.status === 'healthy').length;
  const status = healthyCount === 2 ? 'healthy' : healthyCount === 1 ? 'degraded' : 'unhealthy';

  // Un health check nunca debe quedar en caché de navegadores o proxies
  res.set('Cache-Control', 'no-store');

  return res.status(healthyCount === 2 ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    services: {
      api: { status: 'up', uptime_seconds: Math.floor(process.uptime()) },
      postgres,
      mongodb
    }
  });
}
