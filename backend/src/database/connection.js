import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

let isConnected = false;

export const connectDatabase = async () => {
  if (isConnected) {
    logger.info('Database already connected');
    return;
  }

  try {
    await mongoose.connect(config.mongodb.uri);
    isConnected = true;
    logger.info('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
};
