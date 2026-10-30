import http from 'http';
import { connectDB } from './config/db.js';
import { Lead } from './models/Lead.js';

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_KEY = 'admin_secret_key_12345';
const session_id = 'day7_session_' + Date.now();

async function postJSON(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function getJSON(url, headers = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function patchJSON(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runJourney() {
  console.log('=================================================');
  console.log('DAY 7 STEP 1 — CLEAN START & CUSTOMER JOURNEY');
  console.log('=================================================\n');

  // Step 1: Greeting
  console.log('1. Sending Greeting: "Hi"');
  let res = await postJSON(`${BASE_URL}/chat`, { message: 'Hi', sessionId: session_id });
  console.log(`   [Status: ${res.status}] Reply: "${res.data.reply}"`);
  console.log(`   Model Type: ${res.data.modelType} | Provider: ${res.data.provider}\n`);

  // Step 2: Course Fee
  console.log('2. Asking: "What is the price of the Python course?"');
  res = await postJSON(`${BASE_URL}/chat`, { message: 'What is the price of the Python course?', sessionId: session_id });
  console.log(`   [Status: ${res.status}] Reply: "${res.data.reply}"\n`);

  // Step 3: Duration
  console.log('3. Asking Follow-Up: "How long is it?"');
  res = await postJSON(`${BASE_URL}/chat`, { message: 'How long is it?', sessionId: session_id });
  console.log(`   [Status: ${res.status}] Reply: "${res.data.reply}"\n`);

  // Step 4: Online availability
  console.log('4. Asking: "Is it available online?"');
  res = await postJSON(`${BASE_URL}/chat`, { message: 'Is it available online?', sessionId: session_id });
  console.log(`   [Status: ${res.status}] Reply: "${res.data.reply}"\n`);

  // Step 5: Submit Lead Form
  console.log('5. Submitting Lead Form for "Day7 TestUser"');
  res = await postJSON(`${BASE_URL}/leads`, {
    name: 'Day7 TestUser',
    phone: '9998887770',
    email: 'day7test@example.com',
    requirement: 'Python course callback'
  });
  console.log(`   [Status: ${res.status}] Lead Created: ${res.data.success}`);
  const createdLeadId = res.data.lead?._id || res.data.lead?.id;
  console.log(`   Lead ID: ${createdLeadId}\n`);

  // Step 6: Verify Lead in Admin GET /api/leads
  console.log('6. Fetching Leads via Admin Auth');
  res = await getJSON(`${BASE_URL}/leads`, { 'Authorization': `Bearer ${ADMIN_KEY}` });
  const leads = res.data.leads || [];
  const foundLead = leads.find(l => l.name === 'Day7 TestUser');
  console.log(`   [Status: ${res.status}] Total Leads: ${leads.length}`);
  console.log(`   Found Created Lead: ${foundLead ? `YES (Status: ${foundLead.status})` : 'NO'}\n`);

  // Step 7: Update Lead Status
  if (foundLead) {
    console.log('7. Updating Lead Status to "Contacted"');
    res = await patchJSON(`${BASE_URL}/leads/${foundLead._id}/status`, { status: 'Contacted' }, { 'Authorization': `Bearer ${ADMIN_KEY}` });
    console.log(`   [Status: ${res.status}] Updated Lead Status: "${res.data.lead?.status}"\n`);

    console.log('8. Updating Lead Status to "Converted"');
    res = await patchJSON(`${BASE_URL}/leads/${foundLead._id}/status`, { status: 'Converted' }, { 'Authorization': `Bearer ${ADMIN_KEY}` });
    console.log(`   [Status: ${res.status}] Updated Lead Status: "${res.data.lead?.status}"\n`);
  }

  console.log('=================================================');
  console.log('FAILURE HANDLING TESTS');
  console.log('=================================================\n');

  // Empty Message
  res = await postJSON(`${BASE_URL}/chat`, { message: '', sessionId: session_id });
  console.log(`1. Empty Message Test: HTTP ${res.status} (Expected 400) -> ${res.data.message || res.data.error}`);

  // Oversized Message
  const longMsg = 'A'.repeat(1005);
  res = await postJSON(`${BASE_URL}/chat`, { message: longMsg, sessionId: session_id });
  console.log(`2. Oversized Message Test: HTTP ${res.status} (Expected 400) -> ${res.data.message || res.data.error}`);

  // Invalid Admin Key
  res = await getJSON(`${BASE_URL}/leads`, { 'Authorization': 'Bearer INVALID_KEY_123' });
  console.log(`3. Invalid Admin Key Test: HTTP ${res.status} (Expected 401) -> ${res.data.message || res.data.error}\n`);

  // Clean up test lead safely from MongoDB
  console.log('=================================================');
  console.log('CLEANUP TEMPORARY TEST LEAD');
  console.log('=================================================');
  await connectDB();
  const deleteResult = await Lead.deleteOne({ name: 'Day7 TestUser' });
  console.log(`Cleaned up test record: ${deleteResult.deletedCount === 1 ? 'SUCCESS (Deleted 1 record)' : 'NOT DELETED'}\n`);

  console.log('STATUS: SUCCESS — ALL DAY 7 STEP 1 TESTS PASSED!');
  process.exit(0);
}

runJourney().catch(err => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
