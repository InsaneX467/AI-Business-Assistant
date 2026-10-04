import { GoogleGenerativeAI } from '@google/generative-ai';
import { businessInfo } from '../config/businessInfo.js';

/**
 * Formats business information into a clear context prompt for the LLM
 */
const getSystemPrompt = () => {
  return `You are a helpful, professional AI customer assistant for "${businessInfo.name}".

BUSINESS INFORMATION:
- Business Name: ${businessInfo.name}
- Category: ${businessInfo.category}
- Description: ${businessInfo.description}
- Address/Location: ${businessInfo.location}
- Contact Phone: ${businessInfo.phone}
- Contact Email: ${businessInfo.email}
- Website: ${businessInfo.website}
- Working Hours: ${businessInfo.workingHours}

OFFERED COURSES / SERVICES:
${businessInfo.services.map(s => `- ${s.name} | Duration: ${s.duration} | Mode: ${s.mode} | Fee: ${s.price}\n  Details: ${s.description}`).join('\n')}

FACILITIES & BENEFITS:
${businessInfo.facilities.map(f => `- ${f}`).join('\n')}

FREQUENTLY ASKED QUESTIONS (FAQS):
${businessInfo.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

STRICT RULES YOU MUST FOLLOW:
1. Only answer customer questions based strictly on the business information provided above.
2. DO NOT INVENT or assume any prices, courses, contact details, locations, policies, working hours, guarantees, or discounts that are not explicitly listed.
3. If a customer asks for information that is NOT provided in the business information above (e.g. hostel details, refund policies, unlisted courses), state politely:
   "I don't have that specific information right now. Would you like me to collect your contact details so our team can get in touch with you directly?"
4. Be polite, concise, warm, and professional.
5. Keep answers clear and easy to read on mobile screens.
`;
};

/**
 * Generate AI response for customer user message
 * @param {string} userMessage 
 * @returns {Promise<{ reply: string, success: boolean, error?: string }>}
 */
export const generateAIResponse = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_gemini_api_key_here') {
    return {
      success: false,
      reply: `[Server Notice]: AI API Key is not configured on the backend server. Please add your GEMINI_API_KEY to the server/.env file.`,
      error: 'GEMINI_API_KEY missing'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    // Use gemini-1.5-flash model (or gemini-2.5-flash / gemini-2.0-flash / gemini-1.5-pro)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: getSystemPrompt()
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      reply: text.trim()
    };
  } catch (error) {
    console.error('[AI Service Error]:', error);
    
    // Check if error is due to model name, quota, or network
    if (error.message && error.message.includes('404')) {
      // Retry with alternative model name if needed
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: getSystemPrompt()
        });
        const res = await fallbackModel.generateContent(userMessage);
        const txt = await res.response.text();
        return { success: true, reply: txt.trim() };
      } catch (fallbackErr) {
        console.error('[AI Fallback Error]:', fallbackErr);
      }
    }

    return {
      success: false,
      reply: "I'm sorry, I encountered a temporary issue processing your request. Please try again or leave your contact details so our team can reach out.",
      error: error.message
    };
  }
};
