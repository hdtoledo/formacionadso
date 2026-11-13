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
  let isShuttingDown = false;

  const handleShutdown = (signal) => {
    if (isShuttingDown) return; // Evita ejecutar el cierre dos veces (Ctrl+C repetido)
    isShuttingDown = true;
    console.log(`\n⚠️  Señal ${signal} recibida. Iniciando cierre ordenado (Graceful Shutdown)...`);

    // Timeout de seguridad: si algo se cuelga, forzar la salida a los 10 s.
    // unref() evita que este temporizador mantenga vivo el proceso por sí solo.
    setTimeout(() => {
      console.error('⚠️  Tiempo de espera excedido. Cierre forzado.');
      process.exit(1);
    }, 10000).unref();

    // Detener la recepción de nuevas peticiones y esperar las que están en curso
    server.close(async () => {
      console.log('🛡️  Servidor HTTP Express detenido.');
      await disconnectDatabases();
      console.log('👋 Procesos finalizados con éxito. Saliendo.\n');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  // Promesas rechazadas sin catch: se registran para corregirlas
  process.on('unhandledRejection', (reason) => {
    console.error('💥 [Unhandled Rejection en Promesa]:', reason);
  });

  // Excepción no capturada: el proceso queda en estado incierto, se debe reiniciar
  process.on('uncaughtException', (err) => {
    console.error('💥 [Uncaught Exception Fatal]:', err);
    process.exit(1);
  });
}

bootstrap();
