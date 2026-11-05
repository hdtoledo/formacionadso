/**
 * =============================================================================
 * SENA CADPH Garzón · Regional Huila
 * Punto de Entrada del Servidor HTTP y Orquestación del Ciclo de Vida
 * Archivo: server/src/server.js
 * =============================================================================
 */

import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabases, disconnectDatabases } from './config/db.js';

async function bootstrap() {
  console.log('='.repeat(70));
  console.log('🏛️  SENA CADPH GARZÓN - ARQUITECTURA BACKEND EXPRESS DUAL');
  console.log(`⏱️  Iniciando entorno [${config.nodeEnv.toUpperCase()}] en puerto ${config.port}...`);
  console.log('='.repeat(70));

  // 1. Inicializar conexiones duales de persistencia
  await connectDatabases();

  // 2. Levantar el servidor HTTP Express
  const server = app.listen(config.port, () => {
    console.log(`\n🚀 Servidor escuchando en: http://localhost:${config.port}`);
    console.log(`🔍 Diagnóstico de Salud: http://localhost:${config.port}/api/health`);
    console.log('='.repeat(70) + '\n');
  });

  // 3. Manejo de Cierre Limpio (Graceful Shutdown)
  const handleShutdown = async (signal) => {
    console.log(`\n⚠️  Señal ${signal} recibida. Iniciando cierre ordenado (Graceful Shutdown)...`);
    
    // Detener la recepción de nuevas peticiones HTTP
    server.close(async () => {
      console.log('🛡️  Servidor HTTP Express detenido.');
      
      // Cerrar conexiones activas de bases de datos
      await disconnectDatabases();
      
      console.log('👋 Procesos finalizados con éxito. Saliendo.\n');
      process.exit(0);
    });

    // Timeout de seguridad en caso de que las conexiones tarden demasiado en cerrarse
    setTimeout(() => {
      console.error('⚠️  Tiempo de espera excedido para el cierre forzado.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  // Manejo de rechazos de promesas no controlados
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [Unhandled Rejection en Promesa]:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 [Uncaught Exception Fatal]:', err);
    process.exit(1);
  });
}

bootstrap();
