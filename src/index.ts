import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`🚀 GigFlow API running on port ${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
