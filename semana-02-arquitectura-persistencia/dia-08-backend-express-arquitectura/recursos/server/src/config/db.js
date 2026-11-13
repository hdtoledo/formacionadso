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

// 1. Singleton pg.Pool (PostgreSQL): se crea UNA sola vez y se reutiliza en toda la app
export const pool = new Pool(config.postgres);

pool.on('connect', () => {
  if (!config.isProduction) {
    console.log('🐘 [PostgreSQL] Nuevo cliente físico asignado en el Pool');
  }
});

// Sin este listener, un error en un cliente ocioso tumbaría todo el proceso Node.js
pool.on('error', (err) => {
  console.error('❌ [PostgreSQL Error en Cliente Ocioso]:', err.message);
});

// 2. Listeners de Ciclo de Vida del Singleton de Mongoose (MongoDB)
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
 * Si alguno falla, registra el error en consola pero permite que el servidor
 * arranque y reporte el estado 503 mediante el endpoint de salud.
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
    await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 5000 });
    const latency = Date.now() - start;
    console.log(`✅ [MongoDB Atlas Conectado] Base: "${mongoose.connection.name}" | Latencia: ${latency}ms`);
  } catch (err) {
    console.error(`❌ [MongoDB Falló Conexión]: ${err.message}`);
    console.warn('   Verifique su cadena MONGO_URI y la regla de IP Access List en MongoDB Atlas.');
  }
}

/**
 * Cierre controlado de conexiones para Graceful Shutdown.
 * allSettled: si una base falla al cerrar, la otra igual se cierra.
 */
export async function disconnectDatabases() {
  console.log('\n🛑 [ADSO DUAL DB] Cerrando conexiones a bases de datos de forma segura...');

  const [pgResult, mongoResult] = await Promise.allSettled([
    pool.end(),
    mongoose.connection.close()
  ]);

  if (pgResult.status === 'rejected') {
    console.error('Error cerrando pool de PostgreSQL:', pgResult.reason?.message);
  } else {
    console.log('🔒 [PostgreSQL] Pool cerrado correctamente');
  }

  if (mongoResult.status === 'rejected') {
    console.error('Error cerrando conexión de MongoDB:', mongoResult.reason?.message);
  } else {
    console.log('🔒 [MongoDB] Conexión cerrada correctamente');
  }
}

export { mongoose };
