import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './database/connection.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';
import {
  initFirebaseListener,
  stopFirebaseListener,
  getLatestLiveData,
} from './services/firebase.js';

const app = express();
dotenv.config();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Live Firebase data (not under /api/v1)
app.get('/api/live-data', (req, res) => {
  const data = getLatestLiveData();
  if (!data) {
    return res.status(503).json({ error: 'No live data yet' });
  }
  res.json(data);
});

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    initFirebaseListener((data) => {
      io.emit('sensor-update', data);
    });

    server.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`API available at http://localhost:${config.server.port}/api/v1`);
      logger.info(`Live data at http://localhost:${config.server.port}/api/live-data`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  stopFirebaseListener();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  stopFirebaseListener();
  process.exit(0);
});
