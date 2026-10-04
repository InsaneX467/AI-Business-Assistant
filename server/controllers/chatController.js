import { generateAIResponse } from '../services/aiService.js';
import { businessInfo } from '../config/businessInfo.js';

/**
 * Handle incoming chat message from customer
 * POST /api/chat
 */
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Message is required and cannot be empty.'
      });
    }

    const trimmedMessage = message.trim();

    // Generate AI response via server-side LLM service
    const aiResult = await generateAIResponse(trimmedMessage);

    return res.status(200).json({
      success: true,
      reply: aiResult.reply,
      isFallback: !aiResult.success
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
  return res.status(200).json({
    success: true,
    data: businessInfo
  });
};
