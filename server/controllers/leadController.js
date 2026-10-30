import { Lead, LEAD_STATUS_ENUM } from '../models/Lead.js';
import mongoose from 'mongoose';

let inMemoryLeads = [];

const validatePhone = (phoneStr) => {
  if (!phoneStr) return false;
  const cleanPhone = phoneStr.trim();
  // Validates 10-digit Indian phone numbers starting with 6, 7, 8, or 9 (with optional +91 prefix)
  // or standard phone numbers (at least 7 digits)
  const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
  const generalPhoneRegex = /^\+?\d{7,15}$/;
  return phoneRegex.test(cleanPhone) || generalPhoneRegex.test(cleanPhone.replace(/[\s\(\)\-]/g, ''));
};

/**
 * Submit a new lead
 * POST /api/leads
 */
export const createLead = async (req, res) => {
  try {
    const { name, phone, email, requirement, status } = req.body;

    // Backend validation
    const errors = [];
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters.');
    } else if (name.length > 100) {
      errors.push('Name cannot exceed 100 characters.');
    }

    if (!validatePhone(phone) || (phone && phone.length > 25)) {
      errors.push('Invalid phone number. Please enter a valid phone number (e.g. 9876543210 or +91 9876543210).');
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.push('A valid email address is required.');
    } else if (email.length > 100) {
      errors.push('Email address cannot exceed 100 characters.');
    }

    if (!requirement || typeof requirement !== 'string' || requirement.trim().length === 0) {
      errors.push('Requirement/Interest is required.');
    } else if (requirement.length > 1000) {
      errors.push('Requirement cannot exceed 1000 characters.');
    }

    const leadStatus = status && LEAD_STATUS_ENUM.includes(status) ? status : 'New';

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: errors.join(' '),
        details: errors
      });
    }

    const leadData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      requirement: requirement.trim(),
      status: leadStatus
    };

    if (mongoose.connection.readyState === 1) {
      const newLead = await Lead.create(leadData);
      return res.status(201).json({
        success: true,
        message: 'Lead submitted successfully!',
        lead: newLead,
        storage: 'mongodb'
      });
    } else {
      const fallbackLead = {
        _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...leadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryLeads.unshift(fallbackLead);

      return res.status(201).json({
        success: true,
        message: 'Lead captured successfully (Temporary Local Storage - MongoDB Offline)',
        lead: fallbackLead,
        storage: 'memory'
      });
    }
  } catch (error) {
    console.error('[Lead Controller Error]:', error);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message || 'Failed to save lead'
    });
  }
};

/**
 * Retrieve all leads for admin dashboard
 * GET /api/leads
 */
export const getLeads = async (req, res) => {
  try {
    let leads = [];
    let isMongo = false;

    if (mongoose.connection.readyState === 1) {
      leads = await Lead.find().sort({ createdAt: -1 }).lean();
      isMongo = true;
    } else {
      leads = [...inMemoryLeads];
    }

    // Ensure backwards compatibility by guaranteeing a 'status' field on every lead
    const normalizedLeads = leads.map(l => ({
      ...l,
      status: l.status || 'New'
    }));

    const totalLeads = normalizedLeads.length;
    const newLeads = normalizedLeads.filter(l => l.status === 'New').length;
    const contactedLeads = normalizedLeads.filter(l => l.status === 'Contacted').length;
    const convertedLeads = normalizedLeads.filter(l => l.status === 'Converted').length;

    // Calculate callback requests based on requirement keywords or AI lead capture
    const callbackRequests = normalizedLeads.filter(l => {
      const reqText = (l.requirement || '').toLowerCase();
      return (
        reqText.includes('callback') ||
        reqText.includes('call back') ||
        reqText.includes('phone') ||
        reqText.includes('contact desk') ||
        reqText.includes('counselor')
      );
    }).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLeads = normalizedLeads.filter(l => {
      const created = new Date(l.createdAt);
      return created >= today;
    }).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        convertedLeads,
        callbackRequests,
        todayLeads,
        dbStatus: isMongo ? 'connected' : 'offline (using in-memory store)'
      },
      count: totalLeads,
      leads: normalizedLeads
    });
  } catch (error) {
    console.error('[Get Leads Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to retrieve leads'
    });
  }
};

/**
 * Update lead status (Admin only)
 * PATCH /api/leads/:id/status
 */
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Status is required.'
      });
    }

    const trimmedStatus = status.trim();
    if (!LEAD_STATUS_ENUM.includes(trimmedStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Invalid status '${trimmedStatus}'. Allowed statuses are: ${LEAD_STATUS_ENUM.join(', ')}`
      });
    }

    if (mongoose.connection.readyState === 1 && !id.startsWith('mem_')) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid Lead ID format.'
        });
      }

      // Strict field scoping: ONLY update status field
      const updatedLead = await Lead.findByIdAndUpdate(
        id,
        { $set: { status: trimmedStatus } },
        { new: true, runValidators: true }
      );

      if (!updatedLead) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Lead record not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Lead status updated to '${trimmedStatus}' successfully!`,
        lead: updatedLead
      });
    } else {
      // Memory store fallback
      const index = inMemoryLeads.findIndex(l => String(l._id) === String(id));
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Lead record not found in memory store.'
        });
      }

      inMemoryLeads[index].status = trimmedStatus;
      inMemoryLeads[index].updatedAt = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: `Lead status updated to '${trimmedStatus}' successfully!`,
        lead: inMemoryLeads[index]
      });
    }
  } catch (error) {
    console.error('[Update Lead Status Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to update lead status.'
    });
  }
};
