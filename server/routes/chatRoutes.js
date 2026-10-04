import express from 'express';
import { handleChat, getBusinessInfo } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat
router.post('/', handleChat);

// GET /api/chat/business-info
router.get('/business-info', getBusinessInfo);

export default router;
