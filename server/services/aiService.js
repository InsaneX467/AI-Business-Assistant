import { GoogleGenerativeAI } from '@google/generative-ai';
import { businessInfo, getActiveBusinessInfo } from '../config/businessInfo.js';

const LOCAL_AI_SERVICE_URL = process.env.LOCAL_AI_SERVICE_URL || 'http://127.0.0.1:8000/generate';

/**
 * Formats business information into a clear context prompt for the LLM
 */
const getSystemPrompt = () => {
  const info = getActiveBusinessInfo();
  return `You are a helpful, professional AI admissions counselor for "${info.name}".

BUSINESS INFORMATION:
- Business Name: ${info.name}
- Category: ${info.category}
- Description: ${info.description}
- Address/Location: ${info.location}
- Contact Phone: ${info.phone}
- Contact Email: ${info.email}
- Website: ${info.website}
- Working Hours: ${info.workingHours}

OFFERED COURSES / PROGRAMS:
${info.services.map(s => `- ${s.name} | Duration: ${s.duration} | Mode: ${s.mode} | Fee: ${s.price}\n  Details: ${s.description}`).join('\n')}

FACILITIES & BENEFITS:
${info.facilities.map(f => `- ${f}`).join('\n')}

FREQUENTLY ASKED QUESTIONS (FAQS):
${info.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

STRICT RULES YOU MUST FOLLOW:
1. Only answer customer questions based strictly on the business information provided above.
2. Clearly indicate that fee figures and dates are sample demonstration data when asked about pricing.
3. DO NOT INVENT or assume any prices, courses, contact details, locations, policies, working hours, guarantees, or discounts that are not explicitly listed.
4. If a customer asks for information that is NOT provided in the business information above, state politely:
   "I don't have that specific information right now. Would you like me to collect your contact details so our admissions counselor can get in touch with you directly?"
5. Be polite, concise, warm, and professional.
6. Keep answers clear and easy to read on mobile screens.
`;
};

/**
 * Intelligent Offline Business Knowledge Matcher
 */
const generateOfflineResponse = (query) => {
  const info = getActiveBusinessInfo();
  const q = query.toLowerCase();

  if (q.includes('course') || q.includes('program') || q.includes('offer') || q.includes('neet') || q.includes('jee')) {
    const courseList = info.services.map(s => `• ${s.name} (${s.duration})`).join('\n');
    return `${info.name} currently offers specialized coaching programs:\n\n${courseList}\n\nAll programs are available in Classroom and Hybrid modes. Would you like details on course fees, batch timings, or the scholarship test? [Demo Mode: Sample Data]`;
  }

  if (q.includes('fee') || q.includes('price') || q.includes('cost') || q.includes('charge') || q.includes('pay') || q.includes('installment')) {
    const priceList = info.services.map(s => `• ${s.name}: ${s.price}`).join('\n');
    return `Here is our sample course fee structure:\n\n${priceList}\n\nNote: Up to 90% scholarship is available through our ATSE scholarship test, and flexible monthly installment options are accepted. [Demo Mode: Unverified Sample Fees]`;
  }

  if (q.includes('scholarship') || q.includes('atse') || q.includes('discount')) {
    return `Yes! ${info.name} conducts the ABC Talent Scholarship Exam (ATSE), offering up to 90% scholarship waiver on tuition fees based on merit performance in Science, Maths, and Logical Aptitude. Would you like to request a callback to register?`;
  }

  if (q.includes('batch') || q.includes('time') || q.includes('hour') || q.includes('open') || q.includes('close') || q.includes('timing') || q.includes('schedule')) {
    return `ABC Academy Batch Timings:\n• Morning Batches: 8:00 AM - 12:30 PM\n• Evening Batches: 4:00 PM - 7:30 PM\n• Weekend Intensive: Sat 2:00 PM - 7:00 PM & Sun 8:30 AM - 2:00 PM\n• Dropper Batches: Mon to Fri 8:30 AM - 3:00 PM\n\nCampus Working Hours: ${info.workingHours}`;
  }

  if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('city') || q.includes('place') || q.includes('map')) {
    return `${info.name} is located at:\n📍 ${info.location}\n\nWorking Hours: ${info.workingHours}`;
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('email') || q.includes('call') || q.includes('reach')) {
    return `You can reach ${info.name} at:\n📞 Phone: ${info.phone}\n✉️ Email: ${info.email}\n🌐 Website: ${info.website}`;
  }

  if (q.includes('demo') || q.includes('trial') || q.includes('free class')) {
    return `Yes! ${info.name} offers 2 free demo classes before enrollment so you can experience our faculty teaching methodology and doubt desks.`;
  }

  if (q.includes('doubt') || q.includes('teacher') || q.includes('faculty') || q.includes('mentor')) {
    return `ABC Academy features expert faculty from IITs and AIIMS, along with dedicated 1-on-1 Doubt-Clearing Desks available daily from 8:00 AM to 8:00 PM.`;
  }

  if (q.includes('hostel') || q.includes('transport') || q.includes('bus')) {
    return `Yes, ABC Academy provides tie-up verified hostel recommendations with study environments near campus, along with optional daily AC bus transport routes. [Demo Mode: Sample Data]`;
  }

  return `I don't have that specific information right now. Would you like to leave your contact details using the "Request Callback" button so our admissions team can reach out to you directly?`;
};

/**
 * Call Local FastAPI Python AI Service via native fetch
 */
const callLocalAIService = async (userMessage, sessionId) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(LOCAL_AI_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message: userMessage,
        session_id: sessionId || 'default',
        business_context: null
      })
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      success: true,
      reply: data.reply,
      intent: data.intent || 'unknown',
      confidence: data.confidence || 0.0,
      model_type: data.model_type || 'qwen2.5-lora',
      modelType: data.model_type || 'qwen2.5-lora',
      execution_time_ms: data.execution_time_ms || 0.0,
      executionTimeMs: data.execution_time_ms || 0.0,
      lead: data.lead || null,
      active_course: data.active_course || null,
      activeCourse: data.active_course || null,
      provider: 'local'
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError';
    console.warn(
      `[AI Service Warning]: Local AI service call ${isTimeout ? 'timed out after 15s' : 'failed'}. Falling back to secondary engine...`,
      error.message
    );
    throw error;
  }
};

/**
 * Call Google Gemini API
 */
const callGeminiAIService = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: getSystemPrompt()
  });

  const result = await model.generateContent(userMessage);
  const response = await result.response;
  return {
    success: true,
    reply: response.text().trim(),
    provider: 'gemini'
  };
};

/**
 * Generate AI response for customer user message
 * Routing: Local Python Service -> Gemini API -> Offline Knowledge Fallback Engine
 * @param {string} userMessage 
 * @param {string} [sessionId]
 */
export const generateAIResponse = async (userMessage, sessionId) => {
  const provider = (process.env.AI_PROVIDER || 'local').toLowerCase();

  // Try Local Python AI Service first if AI_PROVIDER is local
  if (provider === 'local') {
    try {
      const localResult = await callLocalAIService(userMessage, sessionId);
      return localResult;
    } catch (err) {
      console.warn('[AI Provider Router]: Falling back from Local AI Service to secondary engine.');
    }
  }

  // Try Gemini API if configured
  if (provider === 'gemini' || process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await callGeminiAIService(userMessage);
      return geminiResult;
    } catch (err) {
      console.warn('[AI Provider Router]: Gemini call unavailable.');
    }
  }

  // Safe fallback to intelligent offline knowledge engine
  const offlineReply = generateOfflineResponse(userMessage);
  return {
    success: true,
    reply: offlineReply,
    intent: 'offline_fallback',
    confidence: 1.0,
    model_type: 'offline_knowledge',
    modelType: 'offline_knowledge',
    execution_time_ms: 0.0,
    executionTimeMs: 0.0,
    lead: null,
    active_course: null,
    activeCourse: null,
    provider: 'offline_knowledge'
  };
};
