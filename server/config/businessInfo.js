import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultJsonPath = process.env.BUSINESS_PROFILE_PATH || path.resolve(__dirname, '../../ai-service/knowledge/business.json');

/**
 * Validates and loads structured business profile from business.json
 */
export const loadBusinessProfile = (filePath = defaultJsonPath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`[BusinessConfig Warning] Business profile file not found at ${resolvedPath}`);
      return null;
    }
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const data = JSON.parse(raw);

    if (!data || typeof data !== 'object') {
      console.error(`[BusinessConfig Error] Invalid profile format in ${resolvedPath}: Must be a JSON object.`);
      return null;
    }

    const bus = data.business;
    if (!bus || typeof bus !== 'object' || !bus.name || typeof bus.name !== 'string' || !bus.name.trim()) {
      console.error(`[BusinessConfig Error] Validation failed for ${resolvedPath}: 'business.name' is required.`);
      return null;
    }

    const courses = (data.courses || []).map(c => ({
      id: c.id,
      name: c.name,
      duration: c.duration,
      mode: Array.isArray(c.mode) ? c.mode.join(' & ') : (c.mode || 'Online & Classroom'),
      price: c.fee || c.price || 'Contact for Pricing',
      fee: c.fee || c.price || 'Contact for Pricing',
      description: c.description,
      eligibility: c.eligibility,
      prerequisites: c.prerequisites,
      careerOutcomes: c.career_outcomes,
      classTimings: c.class_timings
    }));

    const faqs = (data.faq || []).map(f => ({
      question: f.question,
      answer: f.answer
    }));

    return {
      name: bus.name,
      category: bus.tagline || 'Educational & Technical Training Institute',
      tagline: bus.tagline || '',
      description: bus.description || '',
      location: bus.location || '',
      phone: bus.phone || '',
      email: bus.email || '',
      website: bus.website || '',
      workingHours: bus.working_hours || '',
      services: courses,
      courses: courses,
      facilities: data.facilities || [],
      faqs: faqs,
      admission: data.admission || {},
      policies: data.policies || {},
      refundPolicy: data.refund_cancellation || {},
      contact: data.contact || {}
    };
  } catch (err) {
    console.error(`[BusinessConfig Error] Failed to parse business profile: ${err.message}`);
    return null;
  }
};

const initialProfile = loadBusinessProfile();

export const businessInfo = initialProfile || {
  name: "ABC Academy",
  category: "Educational / Technical Training Institute",
  description: "ABC Academy provides hands-on technical training programs and industry-aligned certification courses.",
  location: "123 Tech Park Boulevard, Knowledge City, Metro Pin 560001",
  phone: "+1 (800) 555-0199",
  email: "contact@abcacademy.demo",
  website: "https://www.abcacademy.demo",
  workingHours: "Monday to Saturday: 9:00 AM - 7:00 PM, Sunday: Closed",
  services: [
    { name: "Python Programming Masterclass", duration: "8 weeks", price: "$499", mode: "Online & Offline" },
    { name: "Full Stack Web Development", duration: "12 weeks", price: "$799", mode: "Online & Offline" },
    { name: "Data Science & Machine Learning", duration: "10 weeks", price: "$699", mode: "Online & Offline" },
    { name: "AI & Deep Learning Specialist", duration: "12 weeks", price: "$899", mode: "Online & Offline" },
    { name: "DevOps & Cloud Engineering", duration: "10 weeks", price: "$749", mode: "Online & Offline" }
  ],
  courses: [
    { name: "Python Programming Masterclass", duration: "8 weeks", price: "$499", mode: "Online & Offline" },
    { name: "Full Stack Web Development", duration: "12 weeks", price: "$799", mode: "Online & Offline" },
    { name: "Data Science & Machine Learning", duration: "10 weeks", price: "$699", mode: "Online & Offline" },
    { name: "AI & Deep Learning Specialist", duration: "12 weeks", price: "$899", mode: "Online & Offline" },
    { name: "DevOps & Cloud Engineering", duration: "10 weeks", price: "$749", mode: "Online & Offline" }
  ],
  facilities: [
    "State-of-the-art computer labs",
    "Dedicated career guidance",
    "24/7 access to online student portal"
  ],
  faqs: [
    { question: "Do you offer online classes?", answer: "Yes, all courses offer both Online Live Interactive Classes and Offline Classroom modes." }
  ]
};

/**
 * Returns latest re-read profile or current cached info
 */
export const getActiveBusinessInfo = () => {
  return loadBusinessProfile() || businessInfo;
};
