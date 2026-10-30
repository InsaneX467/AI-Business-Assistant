import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 25000 // 25 seconds timeout for LLM calls
});

/**
 * Send customer message to AI Chat API
 * @param {string} message 
 * @param {string} [sessionId]
 */
export const sendChatMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/chat', { message, sessionId });
    return response.data;
  } catch (error) {
    console.error('[API Error - sendChatMessage]:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to communicate with AI Assistant.';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch business knowledge info from server
 */
export const getBusinessInfo = async () => {
  try {
    const response = await api.get('/chat/business-info');
    return response.data;
  } catch (error) {
    console.error('[API Error - getBusinessInfo]:', error);
    throw error;
  }
};

/**
 * Submit lead form data
 * @param {{ name: string, phone: string, email: string, requirement: string }} leadData 
 */
export const submitLead = async (leadData) => {
  try {
    const response = await api.post('/leads', leadData);
    return response.data;
  } catch (error) {
    console.error('[API Error - submitLead]:', error);
    const errorMessage = error.response?.data?.message || 
      (error.response?.data?.details ? error.response.data.details.join(', ') : 'Failed to submit lead.');
    throw new Error(errorMessage);
  }
};

/**
 * Get all captured leads for Admin Dashboard
 * @param {string} [adminKey]
 */
export const fetchLeads = async (adminKey) => {
  try {
    const headers = {};
    if (adminKey) {
      headers['Authorization'] = `Bearer ${adminKey}`;
    }
    const response = await api.get('/leads', { headers });
    return response.data;
  } catch (error) {
    console.error('[API Error - fetchLeads]:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch leads from server.';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    throw err;
  }
};

/**
 * Update lead status
 * @param {string} leadId 
 * @param {string} status 
 * @param {string} [adminKey]
 */
export const updateLeadStatus = async (leadId, status, adminKey) => {
  try {
    const headers = {};
    if (adminKey) {
      headers['Authorization'] = `Bearer ${adminKey}`;
    }
    const response = await api.patch(`/leads/${leadId}/status`, { status }, { headers });
    return response.data;
  } catch (error) {
    console.error('[API Error - updateLeadStatus]:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update lead status.';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    throw err;
  }
};

export default api;
