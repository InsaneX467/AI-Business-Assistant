from typing import Dict, Any, Optional, Tuple
from app.conversation_manager import ConversationSession

NON_LEAD_INTENTS = {
    "pricing", "course_information", "course_duration", "eligibility",
    "facilities", "refund", "cancellation", "unrelated", "contact",
    "schedule", "documents", "online_learning"
}

class LeadCollector:
    def process_lead_turn(
        self,
        session: ConversationSession,
        intent: str,
        user_message: str,
        entities: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Processes multi-turn lead/callback collection.
        Returns:
        (is_lead_flow: bool, response_prompt: Optional[str], lead_data: Dict[str, Any])
        """
        # Update session entities from current turn
        session.update_entities(entities)

        # If user was in pending lead state but explicitly asked another domain question (without providing phone/name)
        if session.pending_lead_field is not None and intent in NON_LEAD_INTENTS:
            if not entities.get("phone") and not entities.get("name"):
                session.pending_lead_field = None

        # Process callback or active lead collection flow
        if intent == "callback" or session.pending_lead_field is not None:
            # Step 1: Check for name
            if not session.user_name and not entities.get("name"):
                if session.pending_lead_field == "name" and len(user_message.split()) <= 3 and intent not in NON_LEAD_INTENTS:
                    session.user_name = user_message.strip().title()
                else:
                    session.pending_lead_field = "name"
                    response_text = "I'd be happy to arrange a callback from our admissions team! May I know your name?"
                    return True, response_text, self.get_lead_status(session)

            # Step 2: Check for phone number
            if not session.user_phone and not entities.get("phone"):
                cleaned_num = "".join(c for c in user_message if c.isdigit())
                if session.pending_lead_field == "phone" and len(cleaned_num) >= 7:
                    session.user_phone = user_message.strip()
                else:
                    session.pending_lead_field = "phone"
                    name_greeting = f", {session.user_name}" if session.user_name else ""
                    response_text = f"Thanks{name_greeting}! What phone number should our admissions team use to call you back?"
                    return True, response_text, self.get_lead_status(session)

            # Once both name and phone are collected
            session.pending_lead_field = None
            lead = self.get_lead_status(session)
            lead["lead_status"] = "ready"

            course_ref = f" regarding {session.active_course}" if session.active_course else ""
            response_text = (
                f"Thank you, {session.user_name}! I have recorded your request. "
                f"Our admissions counselor will call you back at {session.user_phone}{course_ref} within 24 business hours."
            )
            return True, response_text, lead

        return False, None, self.get_lead_status(session)

    def get_lead_status(self, session: ConversationSession) -> Dict[str, Any]:
        has_name = bool(session.user_name)
        has_phone = bool(session.user_phone)
        status = "ready" if (has_name and has_phone) else ("in_progress" if (has_name or has_phone) else "none")

        return {
            "lead_status": status,
            "name": session.user_name,
            "phone": session.user_phone,
            "email": session.user_email,
            "interested_course": session.active_course,
            "preferred_contact_time": None,
            "enquiry": "Requested callback from admissions team" if (has_name or has_phone) else None,
            "consent": True if status in ["ready", "in_progress"] else False
        }


lead_collector = LeadCollector()
