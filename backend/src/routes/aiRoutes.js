import express from 'express';
import { AIController } from '../controllers/AIController.js';
import { deviceAuth } from '../middlewares/deviceAuth.js';

const router = express.Router();
const aiController = new AIController();

router.get('/latest/:deviceId?', deviceAuth, aiController.getLatest);
router.get('/recent/:deviceId?', deviceAuth, aiController.getRecent);

export default router;
