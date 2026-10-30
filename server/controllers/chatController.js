import { generateAIResponse } from '../services/aiService.js';
import { businessInfo, getActiveBusinessInfo } from '../config/businessInfo.js';
import { Lead } from '../models/Lead.js';
import mongoose from 'mongoose';

/**
 * Handle incoming chat message from customer
 * POST /api/chat
 */
export const handleChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Message is required and cannot be empty.'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Message is too long. Maximum allowed length is 1000 characters.'
      });
    }

    const trimmedMessage = message.trim();

    // Generate AI response via server-side LLM service / gateway
    const aiResult = await generateAIResponse(trimmedMessage, sessionId);

    let leadCaptured = false;

    // Check if AI service captured a completed lead (lead_status === 'ready')
    if (aiResult && aiResult.lead && aiResult.lead.lead_status === 'ready') {
      try {
        const leadData = aiResult.lead;
        const name = (leadData.name || 'Valued Customer').trim();
        const rawPhone = (leadData.phone || '').trim();

        if (rawPhone.length >= 7) {
          // Determine email (use valid provided email or fallback internal placeholder)
          let email = leadData.email ? leadData.email.trim().toLowerCase() : '';
          if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            const phoneDigits = rawPhone.replace(/\D/g, '') || Date.now().toString();
            email = `chat_${phoneDigits}@ai-assistant.local`;
          }

          // Format requirement string using interested_course and enquiry
          let requirement = leadData.enquiry || 'Requested callback from admissions team';
          if (leadData.interested_course) {
            requirement = `Callback requested. Interested course: ${leadData.interested_course}. ${leadData.enquiry || ''}`.trim();
          }

          // Duplicate Protection: Check if a lead with same phone was saved in the last 10 minutes
          const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

          if (mongoose.connection.readyState === 1) {
            const existingLead = await Lead.findOne({
              phone: rawPhone,
              createdAt: { $gte: tenMinsAgo }
            });
            if (!existingLead) {
              await Lead.create({
                name,
                phone: rawPhone,
                email,
                requirement
              });
              leadCaptured = true;
            }
          }
        }
      } catch (leadError) {
        console.error('[Chat Controller - Lead Save Warning]: Failed to auto-save AI lead into database:', leadError.message);
        // Soft failure: do not break the user's chatbot response
      }
    }

    return res.status(200).json({
      success: true,
      reply: aiResult.reply,
      intent: aiResult.intent || 'unknown',
      confidence: aiResult.confidence || 0.0,
      modelType: aiResult.modelType || aiResult.model_type || 'qwen2.5-lora',
      executionTimeMs: aiResult.executionTimeMs || aiResult.execution_time_ms || 0.0,
      leadCaptured: leadCaptured,
      activeCourse: aiResult.activeCourse || aiResult.active_course || null,
      isFallback: !aiResult.success,
      provider: aiResult.provider || 'local'
    });
  } catch (error) {
    console.error('[Chat Controller Error]:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to process chat message. Please try again.'
    });
  }
};

/**
 * Get Business Info metadata endpoint (for frontend dynamic display)
 * GET /api/chat/business-info
 */
export const getBusinessInfo = (req, res) => {
  const currentInfo = getActiveBusinessInfo();
  return res.status(200).json({
    success: true,
    data: currentInfo
  });
};

