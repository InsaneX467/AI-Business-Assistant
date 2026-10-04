import { Lead } from '../models/Lead.js';
import mongoose from 'mongoose';

// Fallback in-memory store if MongoDB is offline during local evaluation
let inMemoryLeads = [];

/**
 * Submit a new lead
 * POST /api/leads
 */
export const createLead = async (req, res) => {
  try {
    const { name, phone, email, requirement } = req.body;

    // Backend validation
    const errors = [];
    if (!name || name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    }
    if (!phone || phone.trim().length < 7) {
      errors.push('A valid phone number is required');
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.push('A valid email address is required');
    }
    if (!requirement || requirement.trim().length === 0) {
      errors.push('Requirement/Interest is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }

    const leadData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      requirement: requirement.trim()
    };

    // Check if MongoDB connection is active (1 = connected)
    if (mongoose.connection.readyState === 1) {
      const newLead = await Lead.create(leadData);
      return res.status(201).json({
        success: true,
        message: 'Lead submitted successfully!',
        lead: newLead,
        storage: 'mongodb'
      });
    } else {
      // Offline / fallback storage
      const fallbackLead = {
        _id: 'mem_' + Date.now(),
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
    return res.status(500).json({
      success: false,
      error: 'Database Error',
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
      leads = await Lead.find().sort({ createdAt: -1 });
      isMongo = true;
    } else {
      leads = inMemoryLeads;
    }

    // Calculate quick statistics
    const totalLeads = leads.length;
    
    // Count today's leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLeads = leads.filter(l => {
      const created = new Date(l.createdAt);
      return created >= today;
    }).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        todayLeads,
        dbStatus: isMongo ? 'connected' : 'offline (using in-memory store)'
      },
      count: totalLeads,
      leads
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
