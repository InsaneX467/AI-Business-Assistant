import express from 'express';
import { createLead, getLeads, updateLeadStatus } from '../controllers/leadController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/leads (Public lead creation)
router.post('/', createLead);

// GET /api/leads (Protected admin lead retrieval)
router.get('/', requireAdminAuth, getLeads);

// PATCH /api/leads/:id/status (Protected admin lead status update)
router.patch('/:id/status', requireAdminAuth, updateLeadStatus);
router.put('/:id/status', requireAdminAuth, updateLeadStatus);

export default router;
