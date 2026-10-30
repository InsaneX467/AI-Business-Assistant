import os
import sys
import json
import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
ADAPTER_PATH = os.path.join("models", "business-assistant-lora")
EVAL_RESULTS_PATH = os.path.join("models", "evaluation_results.json")

TEST_PROMPTS = [
    "Hi, I want to know about your courses.",
    "How much does the course cost?",
    "I don't know which course to choose.",
    "Can someone call me?",
    "Do you offer a robotics program?",
    "Tell me something unrelated to your business."
]

SYSTEM_PROMPT = "You are a professional, helpful, and courteous AI Business Assistant."

def generate_response(model, tokenizer, prompt):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([text], return_tensors="pt").to("cuda")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            do_sample=False,
            temperature=0.0,
            pad_token_id=tokenizer.eos_token_id
        )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, outputs)
    ]
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
    return response

def main():
    print("=" * 60)
    print("AI SERVICE — BASE VS FINE-TUNED ADAPTER COMPARISON")
    print("=" * 60)

    if not torch.cuda.is_available():
        print("ERROR: CUDA is required for model evaluation.")
        sys.exit(1)

    # 1. Load Tokenizer
    print(f"\n--- Loading Tokenizer for {MODEL_ID} ---")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Quantization config for memory efficiency
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True
    )

    # 2. Load Base Model
    print(f"\n--- Loading Base Model ({MODEL_ID}) ---")
    base_model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
        torch_dtype=torch.bfloat16,
        trust_remote_code=True
    )

    print("\n--- Generating Base Model Responses ---")
    base_responses = []
    for prompt in TEST_PROMPTS:
        print(f"Prompt: '{prompt}'")
        resp = generate_response(base_model, tokenizer, prompt)
        base_responses.append(resp)
        print(f"Base Response: {resp}\n")

    # 3. Load Adapter onto Base Model
    print(f"\n--- Loading LoRA Adapter from {ADAPTER_PATH} ---")
    if not os.path.exists(ADAPTER_PATH):
        print(f"ERROR: Adapter path {ADAPTER_PATH} does not exist. Run training first!")
        sys.exit(1)

    finetuned_model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)

    print("\n--- Generating Fine-Tuned Model Responses ---")
    finetuned_responses = []
    for prompt in TEST_PROMPTS:
        print(f"Prompt: '{prompt}'")
        resp = generate_response(finetuned_model, tokenizer, prompt)
        finetuned_responses.append(resp)
        print(f"Fine-Tuned Response: {resp}\n")

    # 4. Save and Compare Results
    results = []
    print("\n" + "=" * 60)
    print("COMPARISON SUMMARY REPORT")
    print("=" * 60)

    for i, prompt in enumerate(TEST_PROMPTS):
        item = {
            "prompt": prompt,
            "base_response": base_responses[i],
            "finetuned_response": finetuned_responses[i]
        }
        results.append(item)

        print(f"\n[PROMPT {i+1}]: {prompt}")
        print(f"  BASE MODEL:     {base_responses[i]}")
        print(f"  FINE-TUNED:     {finetuned_responses[i]}")
        print("-" * 60)

    os.makedirs(os.path.dirname(EVAL_RESULTS_PATH), exist_ok=True)
    with open(EVAL_RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nEvaluation results saved to {EVAL_RESULTS_PATH}")
    print("STATUS: SUCCESS — Comparison completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
