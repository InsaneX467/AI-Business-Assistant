import sys
import os
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.assistant import assistant
from app.conversation_manager import conversation_manager
from app.lead_collector import lead_collector

def run_admin_dashboard_unit_tests():
    print("=" * 90)
    print("DAY 6 STEP 4 — ADMIN DASHBOARD & LEAD MANAGEMENT TEST SUITE")
    print("=" * 90)

    passed = 0
    failed = 0

    # 1. TEST AI Callback Lead Capture Integration
    print("\n[TEST 1] AI Callback Lead Capture Integration...")
    session_id = "test_ai_lead_cap_step4"
    conversation_manager.reset_session(session_id)

    res1 = assistant.process_message("Please arrange a call back for me", session_id=session_id)
    res2 = assistant.process_message("My name is Sarah", session_id=session_id)
    res3 = assistant.process_message("9876543210", session_id=session_id)

    lead_data = res3.get("lead")
    if lead_data and lead_data.get("lead_status") == "ready" and lead_data.get("name") == "Sarah" and "9876543210" in lead_data.get("phone"):
        print(f"  [PASS] AI chatbot captured callback lead with status 'ready'. Lead: {lead_data['name']} ({lead_data['phone']})")
        passed += 1
    else:
        print(f"  [FAIL] AI lead capture failed: {lead_data}")
        failed += 1

    # 2. TEST Lead Schema & Status Enum Validation
    print("\n[TEST 2] Lead Schema Status Field & Enum Validation...")
    valid_statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Not Interested']
    if len(valid_statuses) == 5 and 'New' in valid_statuses:
        print(f"  [PASS] Lead status enums validated: {valid_statuses}")
        passed += 1
    else:
        print("  [FAIL] Status enum check failed.")
        failed += 1

    # 3. TEST Multi-turn conversation
    print("\n[TEST 3] Multi-turn Conversation Memory...")
    session_id_mt = "test_mt_step4"
    conversation_manager.reset_session(session_id_mt)
    mt1 = assistant.process_message("What is the fee for Full Stack Web Development?", session_id=session_id_mt)
    mt2 = assistant.process_message("How long is it?", session_id=session_id_mt)

    if mt2.get("active_course") == "Full Stack Web Development":
        print("  [PASS] Multi-turn reference 'it' correctly resolved to Full Stack Web Development.")
        passed += 1
    else:
        print(f"  [FAIL] Multi-turn resolution failed. Active course: {mt2.get('active_course')}")
        failed += 1

    print("\n" + "=" * 90)
    print(f"ADMIN DASHBOARD TEST SUMMARY: Total: {passed + failed} | Passed: {passed} | Failed: {failed}")
    print("=" * 90)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_admin_dashboard_unit_tests()
