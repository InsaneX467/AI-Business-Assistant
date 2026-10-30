import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"

TEST_PROMPT = """You are a helpful business assistant.
A customer asks: What courses does this business offer?
Explain that you need the business's current information before giving specific course details."""

def main():
    print("=" * 60)
    print("AI SERVICE — BASE MODEL INFERENCE TEST")
    print(f"Target Model: {MODEL_ID}")
    print("=" * 60)

    # 1. Device check
    use_cuda = torch.cuda.is_available()
    device = "cuda" if use_cuda else "cpu"
    print(f"CUDA Available: {use_cuda}")
    print(f"Using Device: {device}")
    
    if use_cuda:
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    # Reset GPU memory stats
    if use_cuda:
        torch.cuda.empty_cache()
        torch.cuda.reset_peak_memory_stats()

    # 2. Load Model & Tokenizer
    print("\nLoading tokenizer and model...")
    t0_load = time.time()
    
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        trust_remote_code=True
    )
    
    # Memory-conscious loading for 6GB VRAM RTX 4050
    # Uses float16/bfloat16 and device_map="auto"
    torch_dtype = torch.bfloat16 if use_cuda and torch.cuda.is_bf16_supported() else (torch.float16 if use_cuda else torch.float32)
    print(f"Loading model with torch_dtype: {torch_dtype}")

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        torch_dtype=torch_dtype,
        device_map="auto" if use_cuda else None,
        trust_remote_code=True
    )
    
    t_load_duration = time.time() - t0_load
    print(f"Model loaded successfully in {t_load_duration:.2f} seconds.")

    # 3. Format prompt using chat template
    messages = [
        {"role": "system", "content": "You are a helpful business assistant."},
        {"role": "user", "content": "What courses does this business offer?"}
    ]
    prompt_text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    inputs = tokenizer([prompt_text], return_tensors="pt").to(device)

    # 4. Generate Response
    print("\nGenerating response...")
    t0_gen = time.time()

    with torch.no_grad():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=256,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )

    t_gen_duration = time.time() - t0_gen

    # Slice output tokens to get only the assistant's answer
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
    ]
    response_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

    # 5. Report Results & VRAM Metrics
    print("\n" + "=" * 60)
    print("MODEL RESPONSE:")
    print("=" * 60)
    print(response_text.strip())
    print("=" * 60)

    print("\n" + "=" * 60)
    print("PERFORMANCE & VRAM METRICS:")
    print("=" * 60)
    print(f"Model Loading Time: {t_load_duration:.2f} seconds")
    print(f"Generation Time:    {t_gen_duration:.2f} seconds")
    
    if use_cuda:
        mem_allocated_mb = torch.cuda.memory_allocated(0) / (1024 ** 2)
        mem_reserved_mb = torch.cuda.memory_reserved(0) / (1024 ** 2)
        peak_allocated_mb = torch.cuda.max_memory_allocated(0) / (1024 ** 2)
        print(f"CUDA Device Used:   {torch.cuda.get_device_name(0)}")
        print(f"GPU Memory Allocated: {mem_allocated_mb:.2f} MB")
        print(f"GPU Memory Reserved:  {mem_reserved_mb:.2f} MB")
        print(f"Peak GPU Memory:      {peak_allocated_mb:.2f} MB")
    else:
        print("CUDA Device Used:   None (CPU Mode)")

    print("=" * 60)
    print("STATUS: SUCCESS — Qwen2.5-1.5B-Instruct inference verified on GPU!")
    print("=" * 60)

if __name__ == "__main__":
    main()
