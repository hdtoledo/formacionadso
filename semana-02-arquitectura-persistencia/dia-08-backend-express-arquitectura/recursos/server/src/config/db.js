/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Conexión Dual Simultánea: PostgreSQL Pool + MongoDB Mongoose Singleton
 * Archivo: server/src/config/db.js
 * =============================================================================
 */

import pg from 'pg';
import mongoose from 'mongoose';
import { config } from './environment.js';

const { Pool } = pg;

// 1. Instanciación del Singleton pg.Pool (PostgreSQL)
export const pool = new Pool(config.postgres);

// Listeners de Ciclo de Vida del Pool de PostgreSQL
pool.on('connect', () => {
  // Solo en desarrollo para trazabilidad interna
  if (config.nodeEnv === 'development') {
    console.log('🐘 [PostgreSQL] Nuevo cliente físico asignado en el Pool');
  }
});

pool.on('error', (err) => {
  console.error('❌ [PostgreSQL Error en Cliente Ocioso]:', err.message);
});

// 2. Configuración de Listeners del Singleton de Mongoose (MongoDB)
mongoose.connection.on('connected', () => {
  console.log('🍃 [MongoDB] Conexión establecida exitosamente con el clúster');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB Error de Conexión]:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MongoDB] Desconectado del servidor de base de datos');
});

/**
 * Inicializa y valida las conexiones a ambos motores de persistencia.
 * Si alguno falla de forma no recuperable, registra el error pero permite
 * que el servidor reporte el estado 503 mediante el endpoint de salud.
 */
export async function connectDatabases() {
  console.log('🔌 [ADSO DUAL DB] Inicializando conexiones a motores de persistencia...');

  // A. Verificación de PostgreSQL Pool
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() AS server_time, current_database() AS db_name');
    const latency = Date.now() - start;
    console.log(`✅ [PostgreSQL Conectado] Base: "${result.rows[0].db_name}" | Latencia: ${latency}ms`);
  } catch (err) {
    console.error(`❌ [PostgreSQL Falló Conexión]: ${err.message}`);
    console.warn('   Verifique que el servicio PostgreSQL esté activo y las credenciales en .env sean válidas.');
  }

  // B. Inicialización de MongoDB Atlas vía Mongoose
  try {
    const start = Date.now();
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 5000
    });
    const latency = Date.now() - start;
    console.log(`✅ [MongoDB Atlas Conectado] Base: "${mongoose.connection.name}" | Latencia: ${latency}ms`);
  } catch (err) {
    console.error(`❌ [MongoDB Falló Conexión]: ${err.message}`);
    console.warn('   Verifique su cadena MONGO_URI y la regla de IP Whitelist en MongoDB Atlas.');
  }
}

/**
 * Cierre controlado de conexiones para Graceful Shutdown
 */
export async function disconnectDatabases() {
  console.log('\n🛑 [ADSO DUAL DB] Cerrando conexiones a bases de datos de forma segura...');
  try {
    await pool.end();
    console.log('🔒 [PostgreSQL] Pool cerrado correctamente');
  } catch (err) {
    console.error('Error cerrando pool de PostgreSQL:', err.message);
  }

  try {
    await mongoose.connection.close();
    console.log('🔒 [MongoDB] Conexión cerrada correctamente');
  } catch (err) {
    console.error('Error cerrando conexión de MongoDB:', err.message);
  }
}

export { mongoose };
