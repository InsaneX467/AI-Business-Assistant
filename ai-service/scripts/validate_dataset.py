import json
import sys
import os

def validate_file(filepath):
    print(f"Validating file: {filepath}")
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        return False, 0, 0, 0

    valid_count = 0
    invalid_count = 0
    duplicate_count = 0
    seen_conversations = set()

    with open(filepath, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f, 1):
            line_str = line.strip()
            if not line_str:
                continue

            try:
                data = json.loads(line_str)
            except json.JSONDecodeError as e:
                print(f"  Line {idx}: Invalid JSON syntax - {e}")
                invalid_count += 1
                continue

            if not isinstance(data, dict) or "messages" not in data:
                print(f"  Line {idx}: Missing 'messages' field")
                invalid_count += 1
                continue

            messages = data["messages"]
            if not isinstance(messages, list) or len(messages) == 0:
                print(f"  Line {idx}: 'messages' must be a non-empty list")
                invalid_count += 1
                continue

            # Validate each message structure
            valid_struct = True
            conv_tuple = []
            for msg in messages:
                if not isinstance(msg, dict) or "role" not in msg or "content" not in msg:
                    valid_struct = False
                    break
                role = msg["role"]
                content = msg["content"]
                if not isinstance(role, str) or not isinstance(content, str):
                    valid_struct = False
                    break
                if role not in ["system", "user", "assistant"]:
                    valid_struct = False
                    break
                if not content.strip():
                    valid_struct = False
                    break
                conv_tuple.append((role, content.strip()))

            if not valid_struct:
                print(f"  Line {idx}: Invalid message structure or empty content")
                invalid_count += 1
                continue

            # Check assistant response presence
            has_assistant = any(msg["role"] == "assistant" for msg in messages)
            if not has_assistant:
                print(f"  Line {idx}: No assistant response in conversation")
                invalid_count += 1
                continue

            # Check duplicates
            conv_key = tuple(conv_tuple)
            if conv_key in seen_conversations:
                duplicate_count += 1
                print(f"  Line {idx}: Duplicate conversation found")
                invalid_count += 1
                continue
            seen_conversations.add(conv_key)

            valid_count += 1

    return (invalid_count == 0 and duplicate_count == 0), valid_count, invalid_count, duplicate_count


def main():
    train_path = os.path.join("datasets", "train.jsonl")
    val_path = os.path.join("datasets", "validation.jsonl")

    # If running from root directory instead of ai-service
    if not os.path.exists(train_path) and os.path.exists(os.path.join("ai-service", "datasets", "train.jsonl")):
        train_path = os.path.join("ai-service", "datasets", "train.jsonl")
        val_path = os.path.join("ai-service", "datasets", "validation.jsonl")

    print("=" * 60)
    print("DATASET VALIDATION REPORT")
    print("=" * 60)

    train_ok, train_valid, train_invalid, train_dup = validate_file(train_path)
    val_ok, val_valid, val_invalid, val_dup = validate_file(val_path)

    total_invalid = train_invalid + val_invalid
    total_duplicates = train_dup + val_dup

    print("\n" + "=" * 60)
    print(f"Training examples:   {train_valid}")
    print(f"Validation examples: {val_valid}")
    print(f"Invalid examples:    {total_invalid}")
    print(f"Duplicate examples:  {total_duplicates}")
    print("=" * 60)

    if not (train_ok and val_ok) or train_valid == 0 or val_valid == 0:
        print("STATUS: FAILED — Dataset validation failed.")
        sys.exit(1)

    print("STATUS: SUCCESS — All dataset examples are valid and clean!")
    print("=" * 60)

if __name__ == "__main__":
    main()
