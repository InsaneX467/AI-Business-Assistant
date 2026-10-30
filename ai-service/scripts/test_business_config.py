import sys
import os
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.business_profile import profile_manager, validate_business_profile, DEFAULT_PROFILE_PATH
from app.knowledge_retriever import _retriever, retrieve_context, get_business_name
from app.assistant import assistant
from app.conversation_manager import conversation_manager
from app.intent_detector import intent_detector

STANDARD_ABC_DATA = {
  "business": {
    "name": "ABC Academy",
    "tagline": "Empowering Future Tech Leaders",
    "description": "ABC Academy is a premier professional training institute specializing in software development, data science, artificial intelligence, and cloud engineering.",
    "location": "123 Tech Park Boulevard, Knowledge City, Metro Pin 560001",
    "phone": "+1 (800) 555-0199",
    "email": "contact@abcacademy.demo",
    "website": "https://www.abcacademy.demo",
    "working_hours": "Monday to Saturday: 9:00 AM - 7:00 PM, Sunday: Closed"
  },
  "courses": [
    {
      "id": "python-programming",
      "name": "Python Programming Masterclass",
      "description": "Comprehensive Python programming course covering core syntax, object-oriented programming, data structures, file handling, and basic automation.",
      "duration": "8 weeks (60 total hours)",
      "fee": "$499",
      "eligibility": "Basic computer literacy; no prior programming experience required. Suitable for complete beginners.",
      "mode": [
        "Online Live Classes",
        "Offline Classroom"
      ],
      "class_timings": "Weekdays 10:00 AM - 12:00 PM or Weekends 2:00 PM - 5:00 PM",
      "prerequisites": "None",
      "career_outcomes": "Junior Python Developer, Automation Script Writer, Software Trainee"
    },
    {
      "id": "web-development",
      "name": "Full Stack Web Development",
      "description": "Hands-on web development bootcamp covering HTML5, CSS3, JavaScript (ES6+), React.js, Node.js, Express, and MongoDB database integration.",
      "duration": "12 weeks (100 total hours)",
      "fee": "$799",
      "eligibility": "High school diploma or equivalent; basic computer operations and logical thinking.",
      "mode": [
        "Online Live Classes",
        "Offline Classroom"
      ],
      "class_timings": "Weekdays 6:00 PM - 8:00 PM or Weekends 10:00 AM - 1:00 PM",
      "prerequisites": "Basic understanding of web browsing and file management.",
      "career_outcomes": "Frontend Developer, Full Stack Web Developer, MERN Stack Developer"
    },
    {
      "id": "data-science",
      "name": "Data Science & Machine Learning",
      "description": "Advanced training in Python, Pandas, NumPy, SQL, Data Visualization (Matplotlib/Seaborn), Scikit-Learn, and introductory supervised Machine Learning.",
      "duration": "10 weeks (80 total hours)",
      "fee": "$699",
      "eligibility": "Basic knowledge of high school algebra/mathematics and introductory Python syntax.",
      "mode": [
        "Online Live Classes",
        "Offline Classroom"
      ],
      "class_timings": "Weekdays 4:00 PM - 6:00 PM or Weekends 10:00 AM - 1:00 PM",
      "prerequisites": "Introductory Python knowledge recommended.",
      "career_outcomes": "Data Analyst, Junior Data Scientist, Machine Learning Associate"
    },
    {
      "id": "ai-ml-specialist",
      "name": "AI & Deep Learning Specialist",
      "description": "Specialized program focusing on Deep Learning architectures, PyTorch, Neural Networks, Computer Vision, and Large Language Model (LLM) fine-tuning.",
      "duration": "12 weeks (96 total hours)",
      "fee": "$899",
      "eligibility": "Intermediate Python programming skills and comfort with basic linear algebra and statistics.",
      "mode": [
        "Online Live Classes",
        "Offline Classroom"
      ],
      "class_timings": "Weekends 10:00 AM - 2:00 PM",
      "prerequisites": "Python programming and foundational machine learning knowledge.",
      "career_outcomes": "AI Engineer, Deep Learning Specialist, NLP / LLM Practitioner"
    },
    {
      "id": "devops-cloud",
      "name": "DevOps & Cloud Engineering",
      "description": "Practical training in Linux administration, Docker containers, Kubernetes orchestration, CI/CD pipelines, Git, and AWS Cloud fundamentals.",
      "duration": "10 weeks (80 total hours)",
      "fee": "$749",
      "eligibility": "Basic understanding of operating systems, networking fundamentals, and command-line usage.",
      "mode": [
        "Online Live Classes",
        "Offline Classroom"
      ],
      "class_timings": "Weekdays 7:00 PM - 9:00 PM or Weekends 2:00 PM - 5:00 PM",
      "prerequisites": "Basic Linux / CLI familiarity.",
      "career_outcomes": "DevOps Engineer, Cloud Administrator, Systems Associate"
    }
  ],
  "course_comparison": {
    "beginner_options": "For absolute beginners without coding experience, Python Programming Masterclass is the best starting point.",
    "web_vs_data": "Full Stack Web Development focuses on creating web apps (React/Node), while Data Science focuses on data analysis, SQL, and predictive machine learning models.",
    "ai_prerequisite": "If you want to take AI & Deep Learning Specialist, we recommend completing Python Programming Masterclass or Data Science first unless you already have Python experience."
  },
  "career_and_placement": {
    "placement_support": "ABC Academy provides dedicated career services including resume building workshops, mock technical interviews, GitHub portfolio optimization, and direct job opening referrals.",
    "guarantee_disclaimer": "We provide placement assistance and career preparation, but we do not issue fake placement guarantees or job promises.",
    "career_counseling": "Free 1-on-1 career counseling is available with our senior academic advisors to help students pick the right domain."
  },
  "facilities": [
    "State-of-the-art computer labs with high-speed internet and development software.",
    "Dedicated career guidance and job placement assistance cell.",
    "Library and quiet study lounge with technical reference books.",
    "Online student portal with recorded lecture videos, slides, and project repositories.",
    "24/7 access to cloud sandbox environments for coding assignments."
  ],
  "admission": {
    "process": [
      "Submit an online application form or visit the campus admissions office.",
      "Attend a brief counseling session with an academic advisor.",
      "Submit required identification and qualification documents.",
      "Pay the course fee via online transfer, credit card, or 0% interest installment plan."
    ],
    "documents_required": [
      "Government-issued Photo ID (Passport, Driver's License, or National ID)",
      "Educational qualification certificates or marksheets",
      "Two recent passport-size photographs"
    ],
    "installment_options": "Course fees can be paid in 2 or 3 interest-free monthly installments during the course duration."
  },
  "refund_cancellation": {
    "policy": "Students can request a full refund within 7 days of course enrollment if no more than 2 classes have been attended. Fee refund requests submitted after 7 days or after attending 3 or more classes are non-refundable, but can be transferred to a future cohort within 6 months.",
    "cancellation": "Enrolled students may request cohort postponement or course cancellation before the start date without penalty."
  },
  "policies": {
    "attendance_policy": "Minimum 80% attendance is required to receive the ABC Academy Certificate of Completion.",
    "certification": "Graduating students receive an industry-recognized ABC Academy Certificate of Completion upon finishing all practical capstone projects.",
    "code_of_conduct": "Students are expected to maintain professional conduct in both physical classrooms and online live sessions."
  },
  "contact": {
    "call_back_policy": "Customers can request a callback by providing their name and phone number. An admissions counselor will call back within 24 business hours.",
    "phone": "+1 (800) 555-0199",
    "email": "contact@abcacademy.demo",
    "address": "123 Tech Park Boulevard, Knowledge City, Metro Pin 560001"
  },
  "faq": [
    {
      "question": "What courses do you offer?",
      "answer": "ABC Academy offers Python Programming Masterclass ($499), Full Stack Web Development ($799), Data Science & Machine Learning ($699), AI & Deep Learning Specialist ($899), and DevOps & Cloud Engineering ($749)."
    },
    {
      "question": "Do you offer online classes?",
      "answer": "Yes, all our courses offer both Online Live Interactive Classes and Offline Classroom modes."
    },
    {
      "question": "What is the refund policy?",
      "answer": "A full refund is available within 7 days of enrollment provided no more than 2 classes have been attended. After 7 days, fees can be transferred to a future cohort within 6 months."
    },
    {
      "question": "Can someone call me for counseling?",
      "answer": "Yes! If you provide your contact details (name and phone number), our admissions counselor will call you back within 24 business hours."
    },
    {
      "question": "Do you offer placement assistance?",
      "answer": "Yes, our career services cell offers resume building, mock technical interviews, portfolio reviews, and job referrals for all students."
    },
    {
      "question": "Can I pay course fees in installments?",
      "answer": "Yes, ABC Academy offers 2 or 3 interest-free monthly installment plans for course fees."
    },
    {
      "question": "What happens if I miss a live class?",
      "answer": "All live sessions are recorded and made available on the student portal within 24 hours along with lecture slides and code code repositories."
    }
  ]
}

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def run_tests():
    print("=" * 90)
    print("DAY 6 STEP 3 — BUSINESS CONFIGURATION & DYNAMIC KNOWLEDGE SUITE")
    print("=" * 90)

    # Reset business.json to standard clean state
    save_json(DEFAULT_PROFILE_PATH, STANDARD_ABC_DATA)
    profile_manager.load_profile(DEFAULT_PROFILE_PATH)
    _retriever.load_and_index()

    passed = 0
    failed = 0

    try:
        # TEST 1: Existing ABC Academy Answers
        print("\n[TEST 1] Verify existing ABC Academy default answers...")
        res1 = assistant.process_message("Who are you?", session_id="test_abc_1")
        print(f"  Query: 'Who are you?' -> Reply: '{res1['reply']}'")
        if "ABC Academy" in res1["reply"]:
            print("  [PASS] Correct default business identity returned.")
            passed += 1
        else:
            print("  [FAIL] Expected ABC Academy in response.")
            failed += 1

        # TEST 2: Current Pricing Retrieved Dynamically
        print("\n[TEST 2] Verify current pricing retrieved dynamically...")
        chunks2 = retrieve_context("What is the fee for Python?")
        top_chunk_content = chunks2[0]["content"] if chunks2 else ""
        print(f"  Retrieved Python Chunk Fee: {top_chunk_content[:100]}...")
        if "$499" in top_chunk_content:
            print("  [PASS] Current pricing $499 retrieved dynamically from profile.")
            passed += 1
        else:
            print("  [FAIL] Expected $499 in retrieved context.")
            failed += 1

        # TEST 3: Update Price Without Retraining
        print("\n[TEST 3] Updating Python price to $999 without model retraining...")
        mod_data = load_json(DEFAULT_PROFILE_PATH)
        mod_data["courses"][0]["fee"] = "$999"
        save_json(DEFAULT_PROFILE_PATH, mod_data)
        
        profile_manager.load_profile(DEFAULT_PROFILE_PATH)
        _retriever.load_and_index()

        chunks3 = retrieve_context("What is the fee for Python?")
        new_content = chunks3[0]["content"] if chunks3 else ""
        print(f"  Retrieved Updated Context: {new_content[:100]}...")
        if "$999" in new_content:
            print("  [PASS] Price updated dynamically to $999 without retraining.")
            passed += 1
        else:
            print("  [FAIL] Updated price $999 not reflected.")
            failed += 1

        # TEST 4: Dynamic Business Name Change
        print("\n[TEST 4] Updating Business Name to 'Nexus Tech Institute'...")
        mod_data["business"]["name"] = "Nexus Tech Institute"
        save_json(DEFAULT_PROFILE_PATH, mod_data)

        profile_manager.load_profile(DEFAULT_PROFILE_PATH)
        _retriever.load_and_index()

        res4 = assistant.process_message("Hello", session_id="test_bus_name")
        print(f"  Greeting Response: '{res4['reply']}'")
        res4_id = assistant.process_message("Who are you?", session_id="test_bus_name_id")
        print(f"  Identity Response: '{res4_id['reply']}'")

        if "Nexus Tech Institute" in res4["reply"] and "Nexus Tech Institute" in res4_id["reply"]:
            print("  [PASS] Business name change dynamically reflected in greetings and identity.")
            passed += 1
        else:
            print("  [FAIL] Business name update failed.")
            failed += 1

        # TEST 5: Missing Business Info Does Not Hallucinate
        print("\n[TEST 5] Verify missing information handling (no hallucination)...")
        res5 = assistant.process_message("Do you teach helicopter flying?", session_id="test_missing_info")
        print(f"  Query: 'Do you teach helicopter flying?' -> Reply: '{res5['reply']}'")
        if "don't currently have that information" in res5["reply"].lower() or res5["confidence"] < 0.25:
            print("  [PASS] Assistant safely declines unknown request without hallucinating.")
            passed += 1
        else:
            print("  [FAIL] Expected decline/fallback response for missing topic.")
            failed += 1

        # TEST 6: Lead Capture Workflow Still Works
        print("\n[TEST 6] Verify lead capture flow...")
        session_id_lead = "test_lead_suite"
        conversation_manager.reset_session(session_id_lead)
        t1 = assistant.process_message("Can someone call me?", session_id=session_id_lead)
        t2 = assistant.process_message("My name is Sarah.", session_id=session_id_lead)
        t3 = assistant.process_message("My number is 8885551234.", session_id=session_id_lead)

        print(f"  Turn 3 Lead Reply: '{t3['reply']}'")
        lead = t3.get("lead")
        if lead and lead.get("lead_status") == "ready" and lead.get("name") == "Sarah" and "8885551234" in lead.get("phone"):
            print("  [PASS] Lead capture workflow succeeded with status 'ready'.")
            passed += 1
        else:
            print(f"  [FAIL] Lead capture failed. Details: {lead}")
            failed += 1

        # TEST 7: Multi-Turn Conversation History
        print("\n[TEST 7] Verify multi-turn context resolution...")
        session_id_mt = "test_multiturn_suite"
        conversation_manager.reset_session(session_id_mt)
        mt1 = assistant.process_message("What is the fee for Python?", session_id=session_id_mt)
        mt2 = assistant.process_message("How long is it?", session_id=session_id_mt)

        print(f"  Turn 1 Active Course: {mt1.get('active_course')}")
        print(f"  Turn 2 Resolved Query Active Course: {mt2.get('active_course')}")
        if mt2.get("active_course") == "Python Programming Masterclass":
            print("  [PASS] Multi-turn reference 'it' correctly resolved to Python Programming Masterclass.")
            passed += 1
        else:
            print(f"  [FAIL] Multi-turn resolution failed. Active course: {mt2.get('active_course')}")
            failed += 1

        # TEST 8: Profile Validation
        print("\n[TEST 8] Verify Profile Validation...")
        invalid_profile = {"business": {}}
        is_val, errs = validate_business_profile(invalid_profile)
        print(f"  Validation result for {{'business': {{}}}}: is_valid={is_val}, errors={errs}")
        if not is_val and len(errs) > 0:
            print("  [PASS] Profile validation correctly caught missing business.name.")
            passed += 1
        else:
            print("  [FAIL] Validation did not catch invalid profile.")
            failed += 1

    finally:
        # RESTORE PRODUCTION DEMO DATA
        print("\n[TEARDOWN] Restoring production demo data in business.json...")
        save_json(DEFAULT_PROFILE_PATH, STANDARD_ABC_DATA)
        profile_manager.load_profile(DEFAULT_PROFILE_PATH)
        _retriever.load_and_index()
        print("[TEARDOWN] Production business.json restored successfully.")

    print("\n" + "=" * 90)
    print(f"TEST SUITE SUMMARY: Total: {passed + failed} | Passed: {passed} | Failed: {failed}")
    print("=" * 90)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
