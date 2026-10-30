from fastapi import FastAPI, HTTPException
from app.schemas import GenerateRequest, GenerateResponse
from app.model_service import model_service
from app.assistant import assistant
import uvicorn

app = FastAPI(
    title="Local AI Business Assistant Service",
    description="FastAPI Local LLM Service running Qwen2.5-1.5B-Instruct + LoRA + Day 4.5 Orchestrator",
    version="1.5.0"
)

@app.on_event("startup")
def startup_event():
    print("[FastAPI Service] Pre-loading local AI model...")
    try:
        model_service.load_model()
    except Exception as e:
        print(f"[FastAPI Error] Model pre-loading warning: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "Local AI Service (Qwen2.5-1.5B)",
        "device": model_service.device,
        "has_lora_adapter": model_service.has_adapter
    }

@app.post("/generate", response_model=GenerateResponse)
def generate_response(req: GenerateRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        session_id = req.session_id or "default"
        res = assistant.process_message(req.message, session_id=session_id)

        model_type = "qwen2.5-lora" if model_service.has_adapter else "qwen2.5-base"

        return GenerateResponse(
            reply=res["reply"],
            intent=res.get("intent", "unknown"),
            confidence=res.get("confidence", 0.0),
            model_type=model_type,
            execution_time_ms=res.get("execution_time_ms", 0.0),
            lead=res.get("lead"),
            active_course=res.get("active_course")
        )
    except Exception as e:
        import traceback
        print(f"[Generate Error]: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Inference processing error.")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
