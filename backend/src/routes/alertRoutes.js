import express from 'express';
import { AlertController } from '../controllers/AlertController.js';
import { deviceAuth } from '../middlewares/deviceAuth.js';

const router = express.Router();
const alertController = new AlertController();

router.get('/:deviceId?', deviceAuth, alertController.getAlerts);
router.post('/:alertId/acknowledge', deviceAuth, alertController.acknowledge);

export default router;
