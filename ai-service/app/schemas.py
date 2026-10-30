from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class GenerateRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    business_context: Optional[Dict[str, Any]] = None

class GenerateResponse(BaseModel):
    reply: str
    intent: Optional[str] = "unknown"
    confidence: Optional[float] = 0.0
    model_type: str = "qwen2.5-lora"
    execution_time_ms: float = 0.0
    lead: Optional[Dict[str, Any]] = None
    active_course: Optional[str] = None
