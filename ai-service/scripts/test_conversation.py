import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.assistant import assistant
from app.conversation_manager import conversation_manager

def run_test_scenario(title: str, turns: list, session_id: str):
    print("\n" + "=" * 80)
    print(f"RUNNING SCENARIO: {title} (Session: {session_id})")
    print("=" * 80)

    conversation_manager.reset_session(session_id)

    for idx, user_input in enumerate(turns, 1):
        print(f"\n[Turn {idx}] User: \"{user_input}\"")
        res = assistant.process_message(user_input, session_id=session_id)
        
        print(f"  -> Intent Detected: {res['intent']} (Conf: {res['confidence']})")
        print(f"  -> Active Course: {res.get('active_course')}")
        if res.get("lead") and res["lead"].get("lead_status") != "none":
            print(f"  -> Lead Status: {res['lead']['lead_status']} | Name: {res['lead']['name']} | Phone: {res['lead']['phone']}")
        print(f"  -> Assistant: {res['reply']}")

def main():
    print("[Test Conversation] Starting multi-turn conversation test suites...")

    # TEST 1 — COURSE + FOLLOW-UP
    run_test_scenario(
        "TEST 1 — COURSE + FOLLOW-UP",
        [
            "What is the Python course fee?",
            "How long is it?",
            "Can I take it online?"
        ],
        "session_test_1"
    )

    # TEST 2 — COURSE RECOMMENDATION
    run_test_scenario(
        "TEST 2 — COURSE RECOMMENDATION",
        [
            "I don't know which course to choose.",
            "I'm interested in AI and data.",
            "I'm a beginner."
        ],
        "session_test_2"
    )

    # TEST 3 — CALLBACK
    run_test_scenario(
        "TEST 3 — CALLBACK",
        [
            "Can someone call me?",
            "My name is Prantik.",
            "My phone number is 9999999999."
        ],
        "session_test_3"
    )

    # TEST 4 — UNKNOWN COURSE
    run_test_scenario(
        "TEST 4 — UNKNOWN COURSE",
        [
            "Do you have a robotics course?"
        ],
        "session_test_4"
    )

    # TEST 5 — UNRELATED
    run_test_scenario(
        "TEST 5 — UNRELATED",
        [
            "Tell me about football."
        ],
        "session_test_5"
    )

    # TEST 6 — POLICY
    run_test_scenario(
        "TEST 6 — POLICY",
        [
            "Can I get a refund after three months?"
        ],
        "session_test_6"
    )

    print("\n" + "=" * 80)
    print("ALL 6 CONVERSATION SCENARIOS COMPLETED.")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
