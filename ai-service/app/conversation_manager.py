import time
import re
from typing import List, Dict, Any, Optional

MAX_HISTORY_TURNS = 10
MAX_SESSIONS = 1000
SESSION_TTL_SECONDS = 1800  # 30 minutes


class ConversationSession:
    def __init__(self, session_id: str = "default"):
        self.session_id = session_id
        self.history: List[Dict[str, str]] = []
        self.active_course: Optional[str] = None
        self.user_name: Optional[str] = None
        self.user_phone: Optional[str] = None
        self.user_email: Optional[str] = None
        self.pending_lead_field: Optional[str] = None
        self.last_accessed: float = time.time()

    def touch(self):
        self.last_accessed = time.time()

    def add_turn(self, role: str, content: str):
        self.touch()
        self.history.append({"role": role, "content": content})
        if len(self.history) > MAX_HISTORY_TURNS * 2:
            self.history = self.history[-MAX_HISTORY_TURNS * 2:]

    def update_entities(self, entities: Dict[str, Any]):
        self.touch()
        if entities.get("course"):
            self.active_course = entities["course"]
        if entities.get("name"):
            self.user_name = entities["name"]
        if entities.get("phone"):
            self.user_phone = entities["phone"]
        if entities.get("email"):
            self.user_email = entities["email"]

    def resolve_references(self, user_message: str) -> str:
        """
        Resolves pronouns or implied references (e.g. 'it', 'this course', 'that course', 'how long is it?')
        by substituting or appending active course context.
        """
        self.touch()
        text = user_message.strip()
        lower = text.lower()

        # Check for pronouns or ambiguous follow-up phrasing
        pronoun_patterns = [
            r"\b(it|this|that|the course|this course|that course)\b",
            r"^(how long|how much|what fee|what are the timings|is it online|can i take it|is there any prerequisite)\??$"
        ]

        needs_resolution = any(re.search(p, lower) for p in pronoun_patterns)

        if needs_resolution and self.active_course:
            # If message doesn't explicitly name another course, attach active_course
            if not any(kw in lower for kw in ["neet", "jee", "iit", "aiims", "foundation", "olympiad", "dropper", "repeater", "medical", "engineering", "python", "web", "data", "ai", "devops"]):
                return f"{user_message} (referring to {self.active_course})"

        return user_message

    def get_context_summary(self) -> str:
        summary_parts = []
        if self.active_course:
            summary_parts.append(f"Active Course Context: {self.active_course}")
        if self.user_name:
            summary_parts.append(f"Customer Name: {self.user_name}")
        if self.user_phone:
            summary_parts.append(f"Customer Phone: {self.user_phone}")
        return "; ".join(summary_parts)


class ConversationManager:
    def __init__(self, max_sessions: int = MAX_SESSIONS, ttl_seconds: int = SESSION_TTL_SECONDS):
        self.sessions: Dict[str, ConversationSession] = {}
        self.max_sessions = max_sessions
        self.ttl_seconds = ttl_seconds

    def _cleanup_expired_and_overflow(self):
        now = time.time()
        # 1. Remove expired sessions
        expired_keys = [
            sid for sid, session in self.sessions.items()
            if (now - session.last_accessed) > self.ttl_seconds
        ]
        for sid in expired_keys:
            del self.sessions[sid]

        # 2. Evict oldest LRU sessions if still exceeding capacity
        if len(self.sessions) > self.max_sessions:
            sorted_sessions = sorted(
                self.sessions.items(),
                key=lambda item: item[1].last_accessed
            )
            excess = len(self.sessions) - self.max_sessions
            for sid, _ in sorted_sessions[:excess]:
                del self.sessions[sid]

    def get_session(self, session_id: str = "default") -> ConversationSession:
        self._cleanup_expired_and_overflow()
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(session_id)
        session = self.sessions[session_id]
        session.touch()
        return session

    def reset_session(self, session_id: str = "default"):
        if session_id in self.sessions:
            del self.sessions[session_id]


conversation_manager = ConversationManager()
