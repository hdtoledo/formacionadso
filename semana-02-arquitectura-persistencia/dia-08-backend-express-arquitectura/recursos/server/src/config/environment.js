/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Módulo de Configuración de Variables de Entorno (Fail-Fast)
 * Archivo: server/src/config/environment.js
 * =============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

// 1. Validación fail-fast: si falta una variable crítica, el servidor NO arranca.
//    Es mejor fallar al iniciar que fallar en plena petición de un usuario.
const REQUIRED_VARS = ['PG_HOST', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD', 'MONGO_URI', 'CLIENT_URL'];
const missingVars = REQUIRED_VARS.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  console.error(`❌ [ADSO CONFIG] Faltan variables en server/.env: ${missingVars.join(', ')}`);
  console.error('   Copie server/.env.example como server/.env y complete los valores.');
  process.exit(1);
}

// 2. Conversión segura de texto a número (process.env siempre entrega strings)
const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const nodeEnv = process.env.NODE_ENV || 'development';

// 3. Objeto de configuración único e inmutable para toda la aplicación
export const config = Object.freeze({
  port: toInt(process.env.PORT, 3000),
  nodeEnv,
  isProduction: nodeEnv === 'production',

  // Único origen autorizado por CORS (el frontend React de la Semana 4)
  clientUrl: process.env.CLIENT_URL,

  // PostgreSQL Pool Config
  postgres: {
    host: process.env.PG_HOST,
    port: toInt(process.env.PG_PORT, 5432),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    max: toInt(process.env.PG_MAX_POOL, 10),                 // Máximo de conexiones físicas abiertas
    idleTimeoutMillis: toInt(process.env.PG_IDLE_TIMEOUT, 30000), // Cierra conexiones ociosas tras 30 s
    connectionTimeoutMillis: 5000,                           // No esperar eternamente por una conexión libre
    statement_timeout: 5000                                  // Ninguna consulta puede tardar más de 5 s
  },

  // MongoDB Atlas Config
  mongo: {
    uri: process.env.MONGO_URI
  }
});
