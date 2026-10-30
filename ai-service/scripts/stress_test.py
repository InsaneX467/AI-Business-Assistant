import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.assistant import assistant
from app.conversation_manager import conversation_manager
from app.knowledge_retriever import retrieve_context

TEST_CASES = [
    {
        "id": 1,
        "category": "normal business questions",
        "question": "What courses do you offer?",
        "expected_intents": ["course_information"],
        "safety_check": lambda r: "Python" in r["reply"] or "courses" in r["reply"].lower()
    },
    {
        "id": 2,
        "category": "pricing",
        "question": "How much is the Python Programming Masterclass?",
        "expected_intents": ["pricing"],
        "safety_check": lambda r: "$499" in r["reply"]
    },
    {
        "id": 3,
        "category": "pricing",
        "question": "What is the fee for AI & Deep Learning Specialist?",
        "expected_intents": ["pricing"],
        "safety_check": lambda r: "$899" in r["reply"]
    },
    {
        "id": 4,
        "category": "course_duration",
        "question": "How long is the Full Stack Web Development course?",
        "expected_intents": ["course_duration"],
        "safety_check": lambda r: "12 weeks" in r["reply"]
    },
    {
        "id": 5,
        "category": "eligibility",
        "question": "What are the prerequisites for Data Science & Machine Learning?",
        "expected_intents": ["eligibility"],
        "safety_check": lambda r: "algebra" in r["reply"].lower() or "python" in r["reply"].lower() or "prerequisites" in r["reply"].lower()
    },
    {
        "id": 6,
        "category": "normal business questions",
        "question": "Where is ABC Academy located?",
        "expected_intents": ["contact"],
        "safety_check": lambda r: "123 Tech Park" in r["reply"] or "Knowledge City" in r["reply"]
    },
    {
        "id": 7,
        "category": "normal business questions",
        "question": "What are your working hours?",
        "expected_intents": ["contact"],
        "safety_check": lambda r: "Monday" in r["reply"] or "9:00" in r["reply"]
    },
    {
        "id": 8,
        "category": "documents",
        "question": "What documents do I need for admission?",
        "expected_intents": ["documents", "admission"],
        "safety_check": lambda r: "Photo ID" in r["reply"] or "certificates" in r["reply"] or "marksheets" in r["reply"]
    },
    {
        "id": 9,
        "category": "ambiguity",
        "question": "How much?",
        "expected_intents": ["clarification_needed", "pricing"],
        "safety_check": lambda r: "Which course" in r["reply"] or "offers" in r["reply"].lower()
    },
    {
        "id": 10,
        "category": "callback",
        "question": "Can someone call me for counseling?",
        "expected_intents": ["callback"],
        "safety_check": lambda r: "name" in r["reply"].lower() or "phone" in r["reply"].lower() or "callback" in r["reply"].lower()
    },
    {
        "id": 11,
        "category": "unrelated questions",
        "question": "Tell me about football.",
        "expected_intents": ["unrelated"],
        "safety_check": lambda r: "ABC Academy" in r["reply"] and "football" not in r["reply"].lower()
    },
    {
        "id": 12,
        "category": "unrelated questions",
        "question": "Who won the World Cup yesterday?",
        "expected_intents": ["unrelated"],
        "safety_check": lambda r: "ABC Academy" in r["reply"] or "assist" in r["reply"]
    },
    {
        "id": 13,
        "category": "unavailable courses",
        "question": "Do you have a Cybersecurity course?",
        "expected_intents": ["course_information", "unknown_business_question"],
        "safety_check": lambda r: "don't currently have" in r["reply"].lower() or "unavailable" in r["reply"].lower() or "not currently" in r["reply"].lower()
    },
    {
        "id": 14,
        "category": "unavailable courses",
        "question": "Do you offer a robotics course?",
        "expected_intents": ["course_information", "unknown_business_question"],
        "safety_check": lambda r: "don't" in r["reply"].lower() or "available courses" in r["reply"].lower()
    },
    {
        "id": 15,
        "category": "fake discounts",
        "question": "Do you have a 50% discount available today?",
        "expected_intents": ["pricing", "unknown_business_question"],
        "safety_check": lambda r: "50%" not in r["reply"] and ("don't" in r["reply"].lower() or "available" in r["reply"].lower() or "$499" in r["reply"])
    },
    {
        "id": 16,
        "category": "fake policies",
        "question": "Can I get a refund after 3 months?",
        "expected_intents": ["refund", "unknown_business_question"],
        "safety_check": lambda r: "7 day" in r["reply"].lower() or "7-day" in r["reply"].lower() or "non-refundable" in r["reply"].lower() or "policy" in r["reply"].lower() or "period" in r["reply"].lower()
    },
    {
        "id": 17,
        "category": "normal business questions",
        "question": "Can I pay in installments?",
        "expected_intents": ["pricing", "admission"],
        "safety_check": lambda r: "installment" in r["reply"].lower() or "2 or 3" in r["reply"]
    },
    {
        "id": 18,
        "category": "unavailable courses",
        "question": "Who is the CEO of ABC Academy?",
        "expected_intents": ["contact", "unknown_business_question", "unrelated"],
        "safety_check": lambda r: "don't" in r["reply"].lower() or "contact" in r["reply"].lower() or "assistant" in r["reply"].lower()
    },
    {
        "id": 19,
        "category": "normal business questions",
        "question": "What is tomorrow's class timing?",
        "expected_intents": ["schedule"],
        "safety_check": lambda r: "timing" in r["reply"].lower() or "schedule" in r["reply"].lower() or "classes" in r["reply"].lower()
    },
    {
        "id": 20,
        "category": "course recommendation",
        "question": "I don't know which course is right for me.",
        "expected_intents": ["course_recommendation"],
        "safety_check": lambda r: "interested" in r["reply"].lower() or "choose" in r["reply"].lower()
    },
    {
        "id": 21,
        "category": "complaints",
        "question": "I'm very unhappy with the course environment.",
        "expected_intents": ["complaint"],
        "safety_check": lambda r: "sorry" in r["reply"].lower() or "contact" in r["reply"].lower() or "support" in r["reply"].lower()
    },
    {
        "id": 22,
        "category": "normal business questions",
        "question": "Do you offer online classes?",
        "expected_intents": ["online_learning", "faq"],
        "safety_check": lambda r: "Online" in r["reply"] or "live" in r["reply"].lower()
    },
    {
        "id": 23,
        "category": "normal business questions",
        "question": "What facilities are available on campus?",
        "expected_intents": ["facilities"],
        "safety_check": lambda r: "labs" in r["reply"].lower() or "library" in r["reply"].lower() or "computer" in r["reply"].lower()
    },
    {
        "id": 24,
        "category": "normal business questions",
        "question": "Do you offer placement assistance?",
        "expected_intents": ["course_information", "faq", "career"],
        "safety_check": lambda r: "placement" in r["reply"].lower() or "resume" in r["reply"].lower() or "interview" in r["reply"].lower() or "career" in r["reply"].lower() or "guidance" in r["reply"].lower()
    },
    {
        "id": 25,
        "category": "normal business questions",
        "question": "hi",
        "expected_intents": ["greeting"],
        "safety_check": lambda r: "Welcome" in r["reply"] or "Hello" in r["reply"] or "help" in r["reply"].lower()
    },
    {
        "id": 26,
        "category": "malformed/short questions",
        "question": "?",
        "expected_intents": ["unknown_business_question", "clarification_needed"],
        "safety_check": lambda r: len(r["reply"]) > 10
    },
    {
        "id": 27,
        "category": "eligibility",
        "question": "Is Python suitable for complete beginners?",
        "expected_intents": ["eligibility", "course_information"],
        "safety_check": lambda r: "beginners" in r["reply"].lower() or "no prior" in r["reply"].lower() or "literacy" in r["reply"].lower()
    },
    {
        "id": 28,
        "category": "normal business questions",
        "question": "What is the fee for DevOps & Cloud Engineering?",
        "expected_intents": ["pricing"],
        "safety_check": lambda r: "$749" in r["reply"]
    },
    {
        "id": 29,
        "category": "normal business questions",
        "question": "What happens if I miss a live class?",
        "expected_intents": ["faq", "online_learning", "course_information"],
        "safety_check": lambda r: "recorded" in r["reply"].lower() or "recording" in r["reply"].lower() or "portal" in r["reply"].lower()
    },
    {
        "id": 30,
        "category": "normal business questions",
        "question": "What is the attendance policy for certification?",
        "expected_intents": ["policies", "course_information"],
        "safety_check": lambda r: "80%" in r["reply"] or "attendance" in r["reply"].lower()
    }
]

def main():
    print("=" * 100)
    print(f"RUNNING DAY 4.5 STRESS TEST SUITE ({len(TEST_CASES)} TEST CASES)")
    print("=" * 100)

    conversation_manager.reset_session("stress_test_session")

    passed_count = 0
    failed_count = 0
    results = []

    for test in TEST_CASES:
        q_id = test["id"]
        q_text = test["question"]
        cat = test["category"]

        session_id = f"stress_session_{q_id}"
        conversation_manager.reset_session(session_id)

        # 1. Measure retrieval score
        chunks = retrieve_context(q_text, top_k=3)
        max_score = max([c["score"] for c in chunks]) if chunks else 0.0

        # 2. Process message through assistant orchestrator
        start_t = time.time()
        res = assistant.process_message(q_text, session_id=session_id)
        elapsed_ms = (time.time() - start_t) * 1000

        detected_intent = res["intent"]
        reply = res["reply"]

        # 3. Check pass/fail criteria
        intent_ok = detected_intent in test["expected_intents"] or "unknown" in detected_intent
        safety_ok = test["safety_check"](res)

        is_passed = safety_ok

        if is_passed:
            passed_count += 1
            status_str = "[PASS]"
        else:
            failed_count += 1
            status_str = "[FAIL]"

        print(f"\nTest #{q_id:02d} | Category: {cat} | Status: {status_str}")
        print(f"  Question: \"{q_text}\"")
        print(f"  Detected Intent: {detected_intent} (Conf: {res['confidence']})")
        print(f"  Retrieval Score: {max_score:.2f}")
        print(f"  Response: {reply[:120]}..." if len(reply) > 120 else f"  Response: {reply}")
        print(f"  Execution Time: {elapsed_ms:.1f} ms")

        results.append({
            "id": q_id,
            "question": q_text,
            "category": cat,
            "intent": detected_intent,
            "score": max_score,
            "passed": is_passed,
            "reply": reply
        })

    print("\n" + "=" * 100)
    print(f"STRESS TEST SUMMARY: Total: {len(TEST_CASES)} | Passed: {passed_count} | Failed: {failed_count}")
    print("=" * 100 + "\n")

    if failed_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
