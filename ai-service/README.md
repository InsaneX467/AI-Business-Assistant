# AI Service — Local Open-Source LLM Engine, QLoRA Fine-Tuning, Local RAG & Product-Ready Assistant

This directory contains the Python local AI service, fine-tuning suite, local Retrieval-Augmented Generation (RAG) engine, and **Central Assistant Orchestrator** for **ABC Academy's AI Business Assistant**.
It uses **Qwen/Qwen2.5-1.5B-Instruct** fine-tuned via **QLoRA (4-bit NF4 Quantization + LoRA)** combined with a **Local Business Knowledge Retrieval System**, **Deterministic Intent Detector**, **Conversation Memory Manager**, and **Lead Collector** running locally on an NVIDIA GeForce RTX 4050 Laptop GPU.

> **IMPORTANT ARCHITECTURAL PRINCIPLE:**
> Business knowledge is kept separate from fine-tuning so changing business information does not require retraining the model.

---

## 1. Environment Details & Hardware
- **Python Version:** 3.10.x
- **PyTorch Version:** 2.6.0+cu124
- **CUDA Runtime:** 12.4
- **Target Hardware:** NVIDIA GeForce RTX 4050 Laptop GPU (6 GB VRAM, 16 GB System RAM)
- **Base Model:** `Qwen/Qwen2.5-1.5B-Instruct`
- **LoRA Adapter:** `ai-service/models/business-assistant-lora/` (36.9 MB)
- **Key Libraries:** `transformers`, `peft`, `trl`, `datasets`, `accelerate`, `bitsandbytes`, `fastapi`, `uvicorn`

---

## 2. Directory Structure
```
ai-service/
├── .venv/                          # Virtual environment (git-ignored)
├── app/
│   ├── main.py                     # FastAPI server (/health, /generate)
│   ├── assistant.py                # Central Assistant Orchestrator
│   ├── intent_detector.py          # Deterministic Local Intent Detector (19 intents)
│   ├── conversation_manager.py     # Local In-Memory Conversation Memory & Reference Resolution
│   ├── lead_collector.py           # Multi-turn Lead / Callback Collection State Machine
│   ├── model_service.py            # Local LLM model loader & RAG prompt builder
│   ├── knowledge_retriever.py      # Local deterministic knowledge chunk retriever
│   └── schemas.py                  # Pydantic API schemas
├── datasets/
│   ├── train.jsonl                 # Training dataset (220 examples)
│   └── validation.jsonl            # Validation dataset (40 examples)
├── knowledge/
│   └── business.json               # Expanded ABC Academy demo business knowledge base
├── models/
│   ├── business-assistant-lora/    # Saved QLoRA behavior adapter (36.9 MB)
│   └── evaluation_results.json     # Base vs fine-tuned evaluation report
├── scripts/
│   ├── check_gpu.py                # GPU & PyTorch CUDA diagnostic script
│   ├── test_model.py               # Base model inference test
│   ├── test_retrieval.py           # Day 4 Local business knowledge retrieval test suite
│   ├── test_rag_pipeline.py        # Day 4 Complete RAG pipeline test suite (Retriever + Qwen + LoRA)
│   ├── test_knowledge_update.py    # Day 4 Dynamic business knowledge update verification
│   ├── test_conversation.py        # Day 4.5 Multi-turn conversation test suite (6 scenarios)
│   └── stress_test.py              # Day 4.5 30-Question Stress Test Suite
├── training/
│   └── train_qlora.py              # QLoRA fine-tuning script
├── requirements.txt                # Dependencies
└── README.md                       # Comprehensive documentation
```

---

## 3. Day 4.5 Central Assistant Architecture

```
User Message
    ↓
Conversation Session (conversation_manager.py)
    ↓
Reference Resolution ("it" / "this course" -> active entity context)
    ↓
Intent Detection & Entity Extraction (intent_detector.py)
    ↓
Lead Collection Flow Check (lead_collector.py)
    ↓
Pre-RAG Intent Routing (greeting, clarification, recommendation, complaint, unrelated)
    ↓
Business Knowledge Retrieval (knowledge_retriever.py)
    ↓
Confidence Decision (Threshold = 0.25)
    ↓
Fine-Tuned Qwen + LoRA RAG Generation (model_service.py)
    ↓
Conversation State Update & Response Return
```

---

## 4. Key Day 4.5 Systems

### A. Intent Detection (`app/intent_detector.py`)
Deterministic local intent classifier supporting 19 intents:
1. `greeting`
2. `course_information`
3. `pricing`
4. `course_duration`
5. `eligibility`
6. `course_recommendation`
7. `admission`
8. `documents`
9. `schedule`
10. `online_learning`
11. `facilities`
12. `refund`
13. `cancellation`
14. `callback`
15. `contact`
16. `complaint`
17. `unknown_business_question`
18. `unrelated`
19. `clarification_needed`

Returns normalized intent, heuristic confidence, and extracted entities (course, name, phone, email).

### B. Conversation Memory (`app/conversation_manager.py`)
- In-memory conversation history bounded to a maximum of 10 turns per session.
- Automatic pronoun and reference resolution across turns (e.g. User asks *"What is the Python course fee?"* → Assistant answers *"The Python course fee is $499."* → User asks *"How long is it?"* → System resolves *"it"* to *"Python Programming Masterclass"*).

### C. Course Recommendation Behavior
- When user asks *"I don't know which course is right for me"*, the assistant asks guiding questions (interests, experience level, goal).
- Uses available business knowledge chunks to recommend suitable courses (e.g. Python Programming Masterclass for beginners, Data Science or AI for advanced students) without inventing non-existent courses.

### D. Lead / Callback Collection (`app/lead_collector.py`)
- Step-by-step multi-turn collection of customer details (`name`, `phone`, `email`, `interested_course`, `enquiry`).
- Collects name first, then phone number, returning structured lead state (`lead_status`: `"in_progress"` → `"ready"`).

### E. Hallucination Protection & Guardrails
- Strengthened confidence threshold (`0.25`).
- Out-of-domain terms or unavailable courses (e.g. *"Cybersecurity"*, *"Robotics"*, *"50% discount"*, *"CEO name"*) trigger a safe fallback stating information is unavailable.
- Unrelated questions (e.g. *"football"*) are politely redirected toward ABC Academy services.

---

## 5. Execution & Testing Commands

### A. Dataset Validation
```bash
python scripts/validate_dataset.py
```

### B. Retrieval Test Suite (12 Test Cases)
```bash
python scripts/test_retrieval.py
```

### C. RAG Pipeline Test Suite
```bash
python scripts/test_rag_pipeline.py
```

### D. Dynamic Knowledge Update Test
```bash
python scripts/test_knowledge_update.py
```

### E. Multi-Turn Conversation Test Suite (6 Scenarios)
```bash
python scripts/test_conversation.py
```

### F. 30-Question Stress Test Suite
```bash
python scripts/stress_test.py
```

---

## 6. Dynamic Knowledge Update Proof

To prove that business knowledge can change **WITHOUT** retraining Qwen:
1. `test_knowledge_update.py` queries Python fee → Model answers **"$499"**.
2. Python fee in `business.json` is updated on disk to **"$599"**.
3. Re-running the query instantly returns **"$599"** with **ZERO** model retraining performed.
4. `business.json` is restored to original state.

---

## 7. Known Limitations & Roadmap

1. **Lead Storage:** Lead collection data is currently generated and managed in-memory as a structured payload. It is **NOT** yet connected to MongoDB (Node/Express integration will occur in subsequent phases).
2. **Conversation State:** Conversation memory is currently local in-memory session state.
3. **Vector Database:** Keyword-based retrieval with synonym expansion is used for explainability and VRAM efficiency. Vector database integration (e.g. Chroma/FAISS) will be added in future steps.
