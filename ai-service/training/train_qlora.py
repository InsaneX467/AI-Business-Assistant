import os
import sys
import argparse
import time
import json
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer, SFTConfig

MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
DEFAULT_OUTPUT_DIR = os.path.join("models", "business-assistant-lora")

def parse_args():
    parser = argparse.ArgumentParser(description="QLoRA Fine-Tuning for Business Assistant")
    parser.add_argument("--model_id", type=str, default=MODEL_ID, help="Base HuggingFace model ID")
    parser.add_argument("--output_dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Directory to save LoRA adapter")
    parser.add_argument("--train_file", type=str, default=os.path.join("datasets", "train.jsonl"), help="Training dataset JSONL")
    parser.add_argument("--val_file", type=str, default=os.path.join("datasets", "validation.jsonl"), help="Validation dataset JSONL")
    parser.add_argument("--smoke_test", action="store_true", help="Run a quick smoke test on 15 samples")
    parser.add_argument("--epochs", type=int, default=2, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=1, help="Per-device train batch size")
    parser.add_argument("--gradient_accumulation_steps", type=int, default=8, help="Gradient accumulation steps")
    parser.add_argument("--learning_rate", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--max_seq_length", type=int, default=512, help="Maximum sequence length")
    parser.add_argument("--lora_r", type=int, default=16, help="LoRA rank r")
    parser.add_argument("--lora_alpha", type=int, default=32, help="LoRA alpha scaling factor")
    parser.add_argument("--lora_dropout", type=float, default=0.05, help="LoRA dropout rate")
    return parser.parse_args()

def main():
    args = parse_args()
    print("=" * 60)
    print("AI SERVICE — QLORA FINE-TUNING")
    print("=" * 60)
    print(f"Model ID:              {args.model_id}")
    print(f"Smoke Test Mode:       {args.smoke_test}")
    print(f"Output Adapter Directory: {args.output_dir}")
    print(f"Batch Size:            {args.batch_size}")
    print(f"Gradient Accumulation: {args.gradient_accumulation_steps}")
    print(f"Max Sequence Length:   {args.max_seq_length}")
    print(f"LoRA Rank (r):         {args.lora_r}")
    print(f"LoRA Alpha:            {args.lora_alpha}")
    print("=" * 60)

    if not torch.cuda.is_available():
        print("ERROR: CUDA is not available. Fine-tuning requires an NVIDIA GPU.")
        sys.exit(1)

    print(f"Using GPU: {torch.cuda.get_device_name(0)}")
    print(f"VRAM Available: {torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB")

    # Step 1: Load Datasets
    print("\n--- Loading Datasets ---")
    data_files = {}
    if os.path.exists(args.train_file):
        data_files["train"] = args.train_file
    else:
        print(f"ERROR: Training file not found at {args.train_file}")
        sys.exit(1)

    if os.path.exists(args.val_file):
        data_files["validation"] = args.val_file

    raw_datasets = load_dataset("json", data_files=data_files)
    train_dataset = raw_datasets["train"]
    val_dataset = raw_datasets.get("validation", None)

    if args.smoke_test:
        train_dataset = train_dataset.select(range(min(15, len(train_dataset))))
        if val_dataset:
            val_dataset = val_dataset.select(range(min(5, len(val_dataset))))
        print(f"Smoke Test Active: Loaded {len(train_dataset)} train samples.")
    else:
        print(f"Loaded {len(train_dataset)} training samples.")
        if val_dataset:
            print(f"Loaded {len(val_dataset)} validation samples.")

    # Step 2: Load Tokenizer
    print("\n--- Loading Tokenizer ---")
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # Step 3: Quantization Configuration (4-bit QLoRA)
    print("\n--- Configuring 4-Bit NF4 Quantization ---")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True
    )

    # Step 4: Load Base Model in 4-bit
    print("\n--- Loading Base Model in 4-bit ---")
    start_time = time.time()
    model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        quantization_config=bnb_config,
        device_map="auto",
        torch_dtype=torch.bfloat16,
        trust_remote_code=True
    )
    model = prepare_model_for_kbit_training(model)
    print(f"Model loaded in {time.time() - start_time:.2f} seconds.")

    # Step 5: Configure LoRA
    print("\n--- Configuring LoRA Adapters ---")
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    peft_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=target_modules
    )

    # Step 6: Formatting Function for Chat Template
    def format_prompts(example):
        messages = example["messages"]
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        return {"text": text}

    print("\n--- Formatting Conversations with Qwen Chat Template ---")
    train_dataset = train_dataset.map(format_prompts, remove_columns=list(train_dataset.column_names))
    if val_dataset:
        val_dataset = val_dataset.map(format_prompts, remove_columns=list(val_dataset.column_names))

    # Step 7: Define Training Arguments
    num_epochs = 1 if args.smoke_test else args.epochs
    save_steps = 10 if args.smoke_test else 50
    logging_steps = 2 if args.smoke_test else 10

    training_args = SFTConfig(
        output_dir=os.path.join("models", "checkpoints"),
        dataset_text_field="text",
        max_length=args.max_seq_length,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        learning_rate=args.learning_rate,
        num_train_epochs=num_epochs,
        logging_steps=logging_steps,
        save_strategy="steps",
        save_steps=save_steps,
        eval_strategy="epoch" if val_dataset and not args.smoke_test else "no",
        fp16=False,
        bf16=True,
        optim="paged_adamw_8bit",
        gradient_checkpointing=True,
        warmup_steps=5,
        lr_scheduler_type="cosine",
        report_to="none"
    )

    # Step 8: Initialize SFTTrainer
    print("\n--- Initializing SFTTrainer ---")
    trainer = SFTTrainer(
        model=model,
        train_dataset=train_dataset,
        eval_dataset=val_dataset if not args.smoke_test else None,
        peft_config=peft_config,
        processing_class=tokenizer,
        args=training_args
    )

    # Step 9: Execute Training
    print("\n--- Starting Training ---")
    train_start = time.time()
    train_result = trainer.train()
    train_duration = time.time() - train_start
    print(f"\nTraining completed in {train_duration:.2f} seconds.")

    # Peak VRAM calculation
    peak_vram_mb = torch.cuda.max_memory_allocated() / (1024 ** 2)
    print(f"Peak GPU VRAM Usage: {peak_vram_mb:.2f} MB")

    # Step 10: Save LoRA Adapter Only
    print(f"\n--- Saving LoRA Adapter to {args.output_dir} ---")
    os.makedirs(args.output_dir, exist_ok=True)
    trainer.model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    # Save training metrics summary
    metrics = {
        "smoke_test": args.smoke_test,
        "train_loss": train_result.training_loss,
        "train_runtime": train_duration,
        "peak_vram_mb": peak_vram_mb,
        "lora_r": args.lora_r,
        "lora_alpha": args.lora_alpha,
        "epochs": num_epochs,
        "batch_size": args.batch_size,
        "gradient_accumulation_steps": args.gradient_accumulation_steps
    }
    with open(os.path.join(args.output_dir, "training_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print("=" * 60)
    print(f"STATUS: SUCCESS — Adapter successfully saved to {args.output_dir}")
    print("=" * 60)

if __name__ == "__main__":
    main()
