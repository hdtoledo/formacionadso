/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Módulo de Configuración de Variables de Entorno Defensivas
 * Archivo: server/src/config/environment.js
 * =============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

// Validación defensiva: Si faltan variables críticas, advertir inmediatamente
const requiredVars = ['PG_HOST', 'PG_DATABASE', 'PG_USER', 'MONGO_URI'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`⚠️ [ADSO SERVER ADVERTENCIA] Faltan variables de entorno requeridas en .env: ${missingVars.join(', ')}`);
  console.warn('   Asegúrese de configurar su archivo server/.env basándose en server/.env.example');
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // PostgreSQL Pool Config
  postgres: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'adso_polyglot_db',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    max: parseInt(process.env.PG_MAX_POOL || '10', 10),
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: 5000
  },

  // MongoDB Atlas Config
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/adso_polyglot_db'
  }
};
