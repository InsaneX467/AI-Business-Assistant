import time
from typing import Dict, Any, List, Optional, Tuple

from app.business_profile import profile_manager
from app.conversation_manager import conversation_manager, ConversationSession
from app.intent_detector import intent_detector
from app.lead_collector import lead_collector
from app.knowledge_retriever import retrieve_context
from app.model_service import model_service, FALLBACK_RESPONSE

def get_greeting_response() -> str:
    return f"Hello! Welcome to {profile_manager.business_name}. How can I help you today?"

def get_greeting_morning() -> str:
    return f"Good morning! Welcome to {profile_manager.business_name}. How can I help you today?"

def get_greeting_afternoon() -> str:
    return f"Good afternoon! Welcome to {profile_manager.business_name}. How can I help you today?"

def get_greeting_evening() -> str:
    return f"Good evening! Welcome to {profile_manager.business_name}. How can I help you today?"

def get_how_are_you_response() -> str:
    return (
        f"I'm doing well, thank you! I'm here to help with {profile_manager.business_name}'s courses, "
        "admissions, fees, schedules, and other related questions. How can I help?"
    )

def get_identity_response() -> str:
    return (
        f"I'm the AI Business Assistant for {profile_manager.business_name}. "
        "I can help answer questions about our courses, admissions, fees, schedules, and facilities."
    )

def get_goodbye_response() -> str:
    return f"Goodbye! Thanks for contacting {profile_manager.business_name}. Have a great day!"

def get_unrelated_response() -> str:
    name = profile_manager.business_name
    return (
        f"I am the AI Assistant for {name}, so I can only help with questions regarding our "
        f"courses, admissions, fees, schedules, and campus facilities. How can I assist you with {name}?"
    )

def get_ambiguous_clarification() -> str:
    name = profile_manager.business_name
    courses = profile_manager.courses
    if courses:
        lines = "\n".join([f"- {c.get('name')} ({c.get('fee', 'Fee on request')})" for c in courses])
        return f"I'd be glad to help with that! Which course are you asking about? {name} offers:\n{lines}"
    return f"I'd be glad to help with that! Which course or service are you asking about for {name}?"

def get_low_confidence_fallback() -> str:
    name = profile_manager.business_name
    courses = profile_manager.courses
    if courses:
        names = ", ".join([c.get('name', '') for c in courses if c.get('name')])
        return (
            f"I don't currently have that information in my business knowledge for {name}. "
            f"I can help you with our available courses ({names}), fees, admissions, or arrange a callback with our team."
        )
    return (
        f"I don't currently have that information in my business knowledge for {name}. "
        "I can help you with our available services, fees, admissions, or arrange a callback with our team."
    )

# Static module-level fallbacks for backward compatibility
RECOMMENDATION_QUESTION = (
    "I'd be happy to help you choose the right coaching program! "
    "Are you preparing for Medical (NEET-UG) or Engineering (JEE Main/Advanced), and which class are you currently in (Class 9, 10, 11, 12, or dropper/repeater)?"
)
HELP_RESPONSE = (
    "Of course! You can ask me about:\n"
    "• Courses\n"
    "• Fees\n"
    "• Course duration\n"
    "• Eligibility\n"
    "• Online/offline classes\n"
    "• Admissions\n"
    "• Refund policies\n"
    "• Or request a callback."
)
THANKS_RESPONSE = "You're very welcome! Let me know if there's anything else I can help you with."
ACKNOWLEDGEMENT_RESPONSE = "Sure! Let me know what you'd like help with."
HUMAN_SUPPORT_RESPONSE = (
    "Absolutely. I can help arrange a callback from our admissions team. May I have your name?"
)
COMPLAINT_RESPONSE = (
    "I am very sorry to hear that you are experiencing an issue. "
    "We take student satisfaction very seriously. May I have your name and phone number so our support team can call you directly to resolve this?"
)

# For backward compatibility if imported directly
GREETING_RESPONSE = get_greeting_response()
GREETING_MORNING = get_greeting_morning()
GREETING_AFTERNOON = get_greeting_afternoon()
GREETING_EVENING = get_greeting_evening()
HOW_ARE_YOU_RESPONSE = get_how_are_you_response()
IDENTITY_RESPONSE = get_identity_response()
GOODBYE_RESPONSE = get_goodbye_response()
UNRELATED_RESPONSE = get_unrelated_response()
AMBIGUOUS_CLARIFICATION = get_ambiguous_clarification()


class BusinessAssistantOrchestrator:
    def __init__(self):
        pass

    def process_message(self, user_message: str, session_id: str = "default") -> Dict[str, Any]:
        start_time = time.time()
        session = conversation_manager.get_session(session_id)

        # 1. Resolve references (e.g. 'it' -> active course)
        resolved_message = session.resolve_references(user_message)

        # 2. Intent Detection & Entity Extraction
        intent_result = intent_detector.detect(resolved_message, session.history)
        intent = intent_result["intent"]
        confidence = intent_result["confidence"]
        entities = intent_result["entities"]

        # Update session active entities
        session.update_entities(entities)

        # 3. Check for Lead / Callback collection flow
        is_lead_flow, lead_prompt, lead_data = lead_collector.process_lead_turn(
            session=session,
            intent=intent,
            user_message=user_message,
            entities=entities
        )
        if is_lead_flow and lead_prompt:
            session.add_turn("user", user_message)
            session.add_turn("assistant", lead_prompt)
            exec_time = (time.time() - start_time) * 1000
            return {
                "reply": lead_prompt,
                "intent": intent,
                "confidence": confidence,
                "retrieved_context": [],
                "execution_time_ms": round(exec_time, 2),
                "lead": lead_data,
                "active_course": session.active_course
            }

        # 4. Fast Deterministic Conversational Intent Routing (Pre-RAG / Pre-LLM)
        fast_reply = None
        if intent == "greeting":
            fast_reply = get_greeting_response()
        elif intent == "greeting_morning":
            fast_reply = get_greeting_morning()
        elif intent == "greeting_afternoon":
            fast_reply = get_greeting_afternoon()
        elif intent == "greeting_evening":
            fast_reply = get_greeting_evening()
        elif intent == "how_are_you":
            fast_reply = get_how_are_you_response()
        elif intent == "help":
            fast_reply = HELP_RESPONSE
        elif intent == "identity":
            fast_reply = get_identity_response()
        elif intent == "thanks":
            fast_reply = THANKS_RESPONSE
        elif intent == "acknowledgement":
            fast_reply = ACKNOWLEDGEMENT_RESPONSE
        elif intent == "goodbye":
            fast_reply = get_goodbye_response()
        elif intent == "human_support":
            session.pending_lead_field = "name"
            fast_reply = HUMAN_SUPPORT_RESPONSE
        elif intent == "clarification_needed":
            fast_reply = get_ambiguous_clarification()
        elif intent == "unrelated":
            fast_reply = get_unrelated_response()
        elif intent == "complaint":
            session.pending_lead_field = "name"
            fast_reply = COMPLAINT_RESPONSE

        if fast_reply is not None:
            session.add_turn("user", user_message)
            session.add_turn("assistant", fast_reply)
            exec_time = (time.time() - start_time) * 1000
            return {
                "reply": fast_reply,
                "intent": intent,
                "confidence": confidence,
                "retrieved_context": [],
                "execution_time_ms": round(exec_time, 2),
                "lead": lead_data,
                "active_course": session.active_course
            }

        if intent == "course_recommendation":
            text_lower = (resolved_message + " " + (session.history[-2]["content"] if len(session.history) >= 2 else "")).lower()
            has_details = any(k in text_lower for k in ["neet", "jee", "medical", "engineering", "iit", "aiims", "dropper", "repeater", "foundation", "olympiad", "class 11", "class 12", "class 9", "class 10", "ai", "web", "data", "beginner", "python", "devops", "cloud", "code", "programming"])

            if not has_details:
                reply = RECOMMENDATION_QUESTION
                session.add_turn("user", user_message)
                session.add_turn("assistant", reply)
                exec_time = (time.time() - start_time) * 1000
                return {
                    "reply": reply,
                    "intent": intent,
                    "confidence": confidence,
                    "retrieved_context": [],
                    "execution_time_ms": round(exec_time, 2),
                    "lead": lead_data,
                    "active_course": session.active_course
                }

        # 5. RAG Retrieval & Generation
        retrieved_chunks = retrieve_context(resolved_message, top_k=3)
        max_score = max([c["score"] for c in retrieved_chunks]) if retrieved_chunks else 0.0

        # Confidence Threshold Check (0.25)
        if max_score < 0.25:
            reply = get_low_confidence_fallback()
            session.add_turn("user", user_message)
            session.add_turn("assistant", reply)
            exec_time = (time.time() - start_time) * 1000
            return {
                "reply": reply,
                "intent": intent,
                "confidence": confidence,
                "retrieved_context": retrieved_chunks,
                "execution_time_ms": round(exec_time, 2),
                "lead": lead_data,
                "active_course": session.active_course
            }

        # 6. Generate via Qwen + LoRA RAG
        reply, chunks, exec_time = model_service.generate_with_rag(resolved_message, top_k=3)

        # Fallback safeguard check
        if reply == FALLBACK_RESPONSE or not reply:
            reply = (
                f"I don't currently have that information in my business knowledge for {profile_manager.business_name}. "
                "I can help you with our available courses, fees, admission process, or connect you with our team."
            )

        session.add_turn("user", user_message)
        session.add_turn("assistant", reply)

        total_exec_time = (time.time() - start_time) * 1000

        return {
            "reply": reply,
            "intent": intent,
            "confidence": confidence,
            "retrieved_context": chunks,
            "execution_time_ms": round(total_exec_time, 2),
            "lead": lead_data,
            "active_course": session.active_course
        }


assistant = BusinessAssistantOrchestrator()
