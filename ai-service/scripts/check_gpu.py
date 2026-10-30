import sys
import torch

def main():
    print("=" * 60)
    print("AI SERVICE — GPU & ENVIRONMENT DIAGNOSTIC")
    print("=" * 60)
    
    print(f"Python Version: {sys.version.split()[0]}")
    print(f"PyTorch Version: {torch.__version__}")
    
    cuda_available = torch.cuda.is_available()
    print(f"CUDA Available: {cuda_available}")
    
    if cuda_available:
        cuda_runtime = torch.version.cuda
        device_count = torch.cuda.device_count()
        device_name = torch.cuda.get_device_name(0)
        
        # Memory stats
        total_memory_bytes = torch.cuda.get_device_properties(0).total_memory
        total_memory_gb = total_memory_bytes / (1024 ** 3)
        allocated_bytes = torch.cuda.memory_allocated(0)
        allocated_mb = allocated_bytes / (1024 ** 2)
        reserved_bytes = torch.cuda.memory_reserved(0)
        reserved_mb = reserved_bytes / (1024 ** 2)
        
        print(f"CUDA Runtime (PyTorch): {cuda_runtime}")
        print(f"Device Count: {device_count}")
        print(f"GPU Name: {device_name}")
        print(f"Total VRAM: {total_memory_gb:.2f} GB ({total_memory_bytes} bytes)")
        print(f"Current VRAM Allocated: {allocated_mb:.2f} MB")
        print(f"Current VRAM Reserved: {reserved_mb:.2f} MB")
        print("=" * 60)
        print("STATUS: SUCCESS - CUDA is ready for local LLM inference!")
        print("=" * 60)
    else:
        print("=" * 60)
        print("STATUS: ERROR - CUDA is NOT available to PyTorch.")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
