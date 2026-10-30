import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.assistant import assistant
from app.conversation_manager import conversation_manager

BASIC_TEST_CASES = [
    {
        "id": 1,
        "question": "Hi",
        "expected_intents": ["greeting"],
        "check": lambda r: "Hello" in r["reply"] or "Welcome" in r["reply"]
    },
    {
        "id": 2,
        "question": "Hello",
        "expected_intents": ["greeting"],
        "check": lambda r: "Hello" in r["reply"] or "Welcome" in r["reply"]
    },
    {
        "id": 3,
        "question": "Hey",
        "expected_intents": ["greeting"],
        "check": lambda r: "Hello" in r["reply"] or "Welcome" in r["reply"]
    },
    {
        "id": 4,
        "question": "Good morning",
        "expected_intents": ["greeting_morning", "greeting"],
        "check": lambda r: "Good morning" in r["reply"] or "Welcome" in r["reply"]
    },
    {
        "id": 5,
        "question": "Good afternoon",
        "expected_intents": ["greeting_afternoon", "greeting"],
        "check": lambda r: "Good afternoon" in r["reply"] or "Welcome" in r["reply"]
    },
    {
        "id": 6,
        "question": "Good evening",
        "expected_intents": ["greeting_evening", "greeting"],
        "check": lambda r: "Good evening" in r["reply"] or "Welcome" in r["reply"]
    },
    {
        "id": 7,
        "question": "How are you?",
        "expected_intents": ["how_are_you"],
        "check": lambda r: "doing well" in r["reply"].lower() or "help" in r["reply"].lower()
    },
    {
        "id": 8,
        "question": "Can you help me?",
        "expected_intents": ["help"],
        "check": lambda r: "Courses" in r["reply"] or "ask me about" in r["reply"].lower() or "help" in r["reply"].lower()
    },
    {
        "id": 9,
        "question": "Help",
        "expected_intents": ["help"],
        "check": lambda r: "Courses" in r["reply"] or "ask me about" in r["reply"].lower() or "help" in r["reply"].lower()
    },
    {
        "id": 10,
        "question": "Who are you?",
        "expected_intents": ["identity"],
        "check": lambda r: "AI Business Assistant" in r["reply"] or "ABC Academy" in r["reply"]
    },
    {
        "id": 11,
        "question": "What can you help me with?",
        "expected_intents": ["help"],
        "check": lambda r: "Courses" in r["reply"] or "fees" in r["reply"].lower() or "admissions" in r["reply"].lower()
    },
    {
        "id": 12,
        "question": "Are you human?",
        "expected_intents": ["identity"],
        "check": lambda r: "AI" in r["reply"] or "assistant" in r["reply"].lower()
    },
    {
        "id": 13,
        "question": "Are you an AI?",
        "expected_intents": ["identity"],
        "check": lambda r: "AI" in r["reply"] or "assistant" in r["reply"].lower()
    },
    {
        "id": 14,
        "question": "Can I talk to a person?",
        "expected_intents": ["human_support", "callback"],
        "check": lambda r: "callback" in r["reply"].lower() or "name" in r["reply"].lower() or "counselor" in r["reply"].lower()
    },
    {
        "id": 15,
        "question": "Thanks",
        "expected_intents": ["thanks"],
        "check": lambda r: "welcome" in r["reply"].lower()
    },
    {
        "id": 16,
        "question": "Thank you",
        "expected_intents": ["thanks"],
        "check": lambda r: "welcome" in r["reply"].lower()
    },
    {
        "id": 17,
        "question": "Okay",
        "expected_intents": ["acknowledgement"],
        "check": lambda r: "Sure" in r["reply"] or "help" in r["reply"].lower()
    },
    {
        "id": 18,
        "question": "Bye",
        "expected_intents": ["goodbye"],
        "check": lambda r: "Goodbye" in r["reply"] or "day" in r["reply"].lower()
    },
    {
        "id": 19,
        "question": "Goodbye",
        "expected_intents": ["goodbye"],
        "check": lambda r: "Goodbye" in r["reply"] or "day" in r["reply"].lower()
    },
    {
        "id": 20,
        "question": "I don't understand",
        "expected_intents": ["clarification_needed"],
        "check": lambda r: "explain" in r["reply"].lower() or "help" in r["reply"].lower() or "courses" in r["reply"].lower()
    }
]

def main():
    print("=" * 100)
    print(f"RUNNING BASIC CONVERSATION TEST SUITE ({len(BASIC_TEST_CASES)} TEST CASES)")
    print("=" * 100)

    passed_count = 0
    failed_count = 0

    for test in BASIC_TEST_CASES:
        t_id = test["id"]
        q_text = test["question"]
        session_id = f"basic_test_session_{t_id}"

        conversation_manager.reset_session(session_id)
        res = assistant.process_message(q_text, session_id=session_id)

        intent = res["intent"]
        reply = res["reply"]

        intent_ok = intent in test["expected_intents"]
        check_ok = test["check"](res)

        is_passed = intent_ok and check_ok
        if is_passed:
            passed_count += 1
            status_str = "PASS"
        else:
            failed_count += 1
            status_str = "FAIL"

        print(f"\n[Test #{t_id:02d}] {status_str}")
        print(f"  QUESTION: \"{q_text}\"")
        print(f"  DETECTED INTENT: {intent} (Conf: {res['confidence']})")
        print(f"  RESPONSE: {reply}")
        print(f"  RESULT: {status_str}")

    print("\n" + "=" * 100)
    print(f"BASIC CONVERSATION SUMMARY: Total: {len(BASIC_TEST_CASES)} | Passed: {passed_count} | Failed: {failed_count}")
    print("=" * 100 + "\n")

    if failed_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
