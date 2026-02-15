import express from 'express';
import sensorRoutes from './sensorRoutes.js';
import aiRoutes from './aiRoutes.js';
import alertRoutes from './alertRoutes.js';

const router = express.Router();

router.use('/sensor', sensorRoutes);
router.use('/ai', aiRoutes);
router.use('/alerts', alertRoutes);

export default router;
