import sys
import os
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.model_service import model_service
from app.knowledge_retriever import DEFAULT_KNOWLEDGE_PATH

QUERY = "What is the fee for Python?"

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def main():
    print("=" * 80)
    print("DAY 4 — BUSINESS KNOWLEDGE UPDATE TEST (NO RETRAINING REQUIRED)")
    print("=" * 80)

    # 1. Pre-load Qwen model
    print("\n[1] Pre-loading Fine-Tuned Qwen Model...")
    model_service.load_model()
    print(f"Model loaded on {model_service.device} with LoRA adapter: {model_service.has_adapter}")

    # 2. Original Knowledge Query
    data = load_json(DEFAULT_KNOWLEDGE_PATH)
    orig_fee = data["courses"][0]["fee"]
    print(f"\n[2] Original Python Course Fee in business.json: {orig_fee}")
    print(f"Running query: \"{QUERY}\"")

    reply_orig, _, time_orig = model_service.generate_with_rag(QUERY)
    print(f"Response: {reply_orig}")

    # 3. Update Knowledge File (Change fee from $499 to $599)
    new_test_fee = "$599"
    print(f"\n[3] Modifying business.json (Updating Python fee to {new_test_fee})...")
    data["courses"][0]["fee"] = new_test_fee
    save_json(DEFAULT_KNOWLEDGE_PATH, data)
    print("business.json updated on disk successfully. ZERO model retraining performed.")

    # 4. Re-test Query with Updated Knowledge
    print(f"\n[4] Running query again: \"{QUERY}\"")
    reply_updated, _, time_updated = model_service.generate_with_rag(QUERY)
    print(f"Updated Response: {reply_updated}")

    # 5. Restore Original Knowledge File
    print(f"\n[5] Reverting business.json Python fee back to original {orig_fee}...")
    data["courses"][0]["fee"] = orig_fee
    save_json(DEFAULT_KNOWLEDGE_PATH, data)
    print("business.json restored to original state.")

    # 6. Verification Summary
    print("\n" + "=" * 80)
    print("KNOWLEDGE UPDATE TEST SUMMARY")
    print("=" * 80)
    print(f"Original Fee Injected:  {orig_fee}")
    print(f"Model Response 1:       {reply_orig}")
    print(f"Updated Fee Injected:   {new_test_fee}")
    print(f"Model Response 2:       {reply_updated}")
    print("=" * 80)
    if new_test_fee in reply_updated or "599" in reply_updated:
        print("STATUS: SUCCESS — Model dynamically answered using updated business data without retraining!")
    else:
        print("STATUS: VERIFICATION WARNING — Check output response formatting.")
    print("=" * 80)

if __name__ == "__main__":
    main()
