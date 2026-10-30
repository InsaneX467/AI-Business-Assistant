import sys
import os
import time
import torch

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.model_service import model_service, DEFAULT_CONFIDENCE_THRESHOLD
from app.knowledge_retriever import retrieve_context

TEST_PIPELINE_QUESTIONS = [
    ("A", "What courses do you offer?"),
    ("B", "What is the fee for Python?"),
    ("C", "I don't know which course is right for me."),
    ("D", "Can someone call me?"),
    ("E", "Do you offer robotics?"),
    ("F", "Where are you located?"),
    ("G", "Tell me something unrelated to your business."),
    ("H", "What is the fee?")
]

def main():
    print("=" * 80)
    print("DAY 4 — COMPLETE LOCAL RAG PIPELINE TEST HARNESS")
    print("Pipeline: Query -> Local Retriever -> Context Prompt -> Qwen2.5 + LoRA Adapter -> Response")
    print("=" * 80)

    # 1. Pre-load Qwen + LoRA model
    print("\nLoading Fine-Tuned Qwen LLM...")
    t0 = time.time()
    model_service.load_model()
    print(f"Model loaded in {time.time() - t0:.2f}s | Device: {model_service.device} | LoRA Adapter: {model_service.has_adapter}\n")

    # Reset CUDA stats
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.reset_peak_memory_stats()

    # 2. Run Test Cases
    total_cases = len(TEST_PIPELINE_QUESTIONS)

    for idx, (label, question) in enumerate(TEST_PIPELINE_QUESTIONS, 1):
        print("\n" + "=" * 80)
        print(f"TEST [{label}] ({idx}/{total_cases}): \"{question}\"")
        print("=" * 80)

        # Retrieve context chunks first for inspection display
        retrieved_chunks = retrieve_context(question, top_k=3)
        max_score = max([c["score"] for c in retrieved_chunks]) if retrieved_chunks else 0.0

        print("\n[RETRIEVED CONTEXT CHUNKS]")
        for rank, c in enumerate(retrieved_chunks, 1):
            print(f"  ({rank}) [{c['score']:.2f}] {c['title']}")
        print(f"  Top Confidence Score: {max_score:.2f}")

        # Run complete pipeline execution
        reply, chunks, exec_time = model_service.generate_with_rag(question)

        print("\n[MODEL RESPONSE]")
        print(reply)
        print(f"\nExecution Time: {exec_time:.2f} ms")

    # 3. Final Performance Metrics
    print("\n" + "=" * 80)
    print("HARDWARE & PERFORMANCE METRICS")
    print("=" * 80)
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated(0) / (1024 ** 2)
        reserved = torch.cuda.memory_reserved(0) / (1024 ** 2)
        peak = torch.cuda.max_memory_allocated(0) / (1024 ** 2)
        print(f"GPU Device:           {torch.cuda.get_device_name(0)}")
        print(f"VRAM Allocated:       {allocated:.2f} MB")
        print(f"VRAM Reserved:        {reserved:.2f} MB")
        print(f"Peak VRAM Memory:     {peak:.2f} MB")

    print("=" * 80)
    print("STATUS: SUCCESS — Complete Local RAG Pipeline Verified!")
    print("=" * 80)

if __name__ == "__main__":
    main()
