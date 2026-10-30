import sys
import os

# Add parent directory to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.knowledge_retriever import retrieve_context, LocalKnowledgeRetriever

TEST_QUESTIONS = [
    "What courses do you offer?",
    "How much is the Python course?",
    "How long is the Python course?",
    "What are the eligibility requirements?",
    "Where are you located?",
    "What are your working hours?",
    "What documents do I need for admission?",
    "Do you offer online classes?",
    "Can someone call me?",
    "Do you have a robotics course?",
    "What is your refund policy?",
    "Tell me something about football."
]

CONFIDENCE_THRESHOLD = 0.25

def main():
    print("=" * 80)
    print("DAY 4 — BUSINESS KNOWLEDGE RETRIEVAL TEST HARNESS")
    print(f"Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    print("=" * 80)

    retriever = LocalKnowledgeRetriever()
    print(f"Loaded {len(retriever.chunks)} business knowledge chunks from business.json\n")

    passed_tests = 0
    total_tests = len(TEST_QUESTIONS)

    for idx, q in enumerate(TEST_QUESTIONS, 1):
        print(f"\n[{idx}/{total_tests}] QUESTION: \"{q}\"")
        print("-" * 80)

        chunks = retrieve_context(q, top_k=3)
        max_score = max([c["score"] for c in chunks]) if chunks else 0.0

        print("TOP RETRIEVED CONTEXT CHUNKS:")
        for rank, chunk in enumerate(chunks, 1):
            content_snippet = chunk['content'].replace('\n', ' ')
            if len(content_snippet) > 120:
                content_snippet = content_snippet[:117] + "..."
            print(f"  Rank {rank} | Title: {chunk['title']:<40} | Score: {chunk['score']:.2f}")
            print(f"          Snippet: {content_snippet}")

        is_confident = max_score >= CONFIDENCE_THRESHOLD
        status = "CONFIDENT MATCH" if is_confident else "LOW CONFIDENCE (FALLBACK TRIGGERED)"

        print(f"MAX SCORE: {max_score:.2f}  |  STATUS: {status}")
        print("=" * 80)

        passed_tests += 1

    print("\n" + "=" * 80)
    print(f"RETRIEVAL TEST COMPLETE: Processed {passed_tests}/{total_tests} test cases successfully.")
    print("=" * 80)

if __name__ == "__main__":
    main()
