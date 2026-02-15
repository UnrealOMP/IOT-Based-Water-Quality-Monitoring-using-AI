import express from 'express';
import { SensorController } from '../controllers/SensorController.js';
import { deviceAuth } from '../middlewares/deviceAuth.js';
import { validateSensorReading } from '../middlewares/validator.js';

const router = express.Router();
const sensorController = new SensorController();

/* ================= ESP32 ================= */

// ESP32 → Backend (secured)
router.post(
  '/ingest',
  deviceAuth,
  validateSensorReading,
  sensorController.ingest
);

/* ================= FRONTEND ================= */

// Frontend → Backend (NO deviceAuth)
router.get('/latest/:deviceId?', sensorController.getLatest);
router.get('/recent/:deviceId?', sensorController.getRecent);
router.get('/dashboard/:deviceId?', sensorController.getDashboard);

export default router;
