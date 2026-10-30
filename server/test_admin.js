import dotenv from 'dotenv';
import { createLead, getLeads, updateLeadStatus } from './controllers/leadController.js';
import { requireAdminAuth } from './middleware/auth.js';

dotenv.config();

const runNodeAdminTests = async () => {
  console.log('================================================================================');
  console.log('DAY 6 STEP 4 — NODE BACKEND ADMIN DASHBOARD & LEAD API TEST HARNESS');
  console.log('================================================================================');

  let passed = 0;
  let failed = 0;

  const mockRes = () => {
    const res = {
      statusCode: 200,
      responseData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.responseData = data;
        return this;
      }
    };
    return res;
  };

  // 1. TEST Unauthorized GET /api/leads
  console.log('\n[TEST 1] Unauthorized Admin Access (Missing Key)...');
  const req1 = { headers: {} };
  const res1 = mockRes();
  let nextCalled = false;
  requireAdminAuth(req1, res1, () => { nextCalled = true; });

  if (res1.statusCode === 401 && !nextCalled) {
    console.log('  [PASS] Unauthorized request rejected with 401.');
    passed++;
  } else {
    console.log('  [FAIL] Unauthorized request was not blocked correctly.', res1.statusCode);
    failed++;
  }

  // 2. TEST Authorized GET /api/leads
  console.log('\n[TEST 2] Authorized Lead Retrieval...');
  process.env.ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'demo_admin_secret_key_123';
  const req2 = { headers: { authorization: `Bearer ${process.env.ADMIN_API_KEY}` } };
  const res2 = mockRes();
  let nextCalled2 = false;
  requireAdminAuth(req2, res2, () => { nextCalled2 = true; });

  if (nextCalled2) {
    console.log('  [PASS] Authorized admin request passed authentication check.');
    passed++;
  } else {
    console.log('  [FAIL] Authorized admin request failed auth check.');
    failed++;
  }

  // 3. TEST New Lead Creation
  console.log('\n[TEST 3] New Lead Creation...');
  const req3 = {
    body: {
      name: 'Test Admin Lead',
      phone: '9876543210',
      email: 'adminlead@demo.local',
      requirement: 'Callback requested for Python course'
    }
  };
  const res3 = mockRes();
  await createLead(req3, res3);

  let createdLeadId = null;
  if (res3.statusCode === 201 && res3.responseData?.success) {
    createdLeadId = res3.responseData.lead._id;
    console.log(`  [PASS] Lead created successfully. ID: ${createdLeadId}, Status: ${res3.responseData.lead.status}`);
    passed++;
  } else {
    console.log('  [FAIL] Lead creation failed:', res3.responseData);
    failed++;
  }

  // 4. TEST Lead Retrieval & Metrics Calculation
  console.log('\n[TEST 4] Lead Retrieval & Metrics Calculation...');
  const req4 = {};
  const res4 = mockRes();
  await getLeads(req4, res4);

  if (res4.statusCode === 200 && res4.responseData?.stats) {
    const stats = res4.responseData.stats;
    console.log(`  Stats: Total=${stats.totalLeads}, New=${stats.newLeads}, Callbacks=${stats.callbackRequests}`);
    if (stats.totalLeads > 0 && stats.newLeads >= 1 && stats.callbackRequests >= 1) {
      console.log('  [PASS] Metrics calculated correctly from stored lead records.');
      passed++;
    } else {
      console.log('  [FAIL] Metric calculation failed.', stats);
      failed++;
    }
  } else {
    console.log('  [FAIL] Get leads failed:', res4.responseData);
    failed++;
  }

  // 5. TEST Status Update (Valid Status: "Converted")
  console.log('\n[TEST 5] Status Update to "Converted"...');
  if (createdLeadId) {
    const req5 = { params: { id: String(createdLeadId) }, body: { status: 'Converted' } };
    const res5 = mockRes();
    await updateLeadStatus(req5, res5);

    if (res5.statusCode === 200 && res5.responseData?.lead?.status === 'Converted') {
      console.log('  [PASS] Lead status successfully updated to Converted.');
      passed++;
    } else {
      console.log('  [FAIL] Status update failed:', res5.responseData);
      failed++;
    }
  }

  // 6. TEST Invalid Status Rejection (Invalid Status: "SuperLead")
  console.log('\n[TEST 6] Invalid Status Rejection...');
  if (createdLeadId) {
    const req6 = { params: { id: String(createdLeadId) }, body: { status: 'SuperLead' } };
    const res6 = mockRes();
    await updateLeadStatus(req6, res6);

    if (res6.statusCode === 400 && res6.responseData?.error === 'Validation Error') {
      console.log(`  [PASS] Invalid status 'SuperLead' rejected with 400 Bad Request.`);
      passed++;
    } else {
      console.log('  [FAIL] Invalid status was not rejected correctly:', res6.responseData);
      failed++;
    }
  }

  console.log('\n================================================================================');
  console.log(`NODE ADMIN TEST SUMMARY: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================================');

  process.exit(failed > 0 ? 1 : 0);
};

runNodeAdminTests();
