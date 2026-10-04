import express from 'express';
import { createLead, getLeads } from '../controllers/leadController.js';

const router = express.Router();

// POST /api/leads
router.post('/', createLead);

// GET /api/leads
router.get('/', getLeads);

export default router;
