import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API escuchando en http://localhost:${env.PORT}`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} recibido, cerrando servidor...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
