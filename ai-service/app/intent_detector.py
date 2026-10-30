import re
from typing import Dict, Any, Optional, List
from app.business_profile import profile_manager


COURSE_ALIASES = {
    # NEET & Medical aliases
    "neet": "NEET-UG 2-Year Medical Master Program (Class 11 & 12)",
    "neet-ug": "NEET-UG 2-Year Medical Master Program (Class 11 & 12)",
    "medical": "NEET-UG 2-Year Medical Master Program (Class 11 & 12)",
    "aiims": "NEET-UG 2-Year Medical Master Program (Class 11 & 12)",
    "biology": "NEET-UG 2-Year Medical Master Program (Class 11 & 12)",
    "doctor": "NEET-UG 2-Year Medical Master Program (Class 11 & 12)",
    "neet dropper": "NEET-UG 1-Year Dropper / Repeater Achiever Batch",
    "dropper neet": "NEET-UG 1-Year Dropper / Repeater Achiever Batch",
    
    # JEE & Engineering aliases
    "jee": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "jee main": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "jee advanced": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "iit": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "iit jee": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "engineering": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "pcm": "JEE (Main + Advanced) 2-Year Integrated Program (Class 11 & 12)",
    "jee dropper": "JEE 1-Year Dropper / Repeater Rank Booster Cohort",
    "dropper jee": "JEE 1-Year Dropper / Repeater Rank Booster Cohort",
    "repeater": "JEE 1-Year Dropper / Repeater Rank Booster Cohort",
    "dropper": "JEE 1-Year Dropper / Repeater Rank Booster Cohort",
    
    # Foundation & Olympiad aliases
    "foundation": "Foundation & Olympiad Program (Class 9 & 10 Pre-JEE/NEET)",
    "olympiad": "Foundation & Olympiad Program (Class 9 & 10 Pre-JEE/NEET)",
    "class 9": "Foundation & Olympiad Program (Class 9 & 10 Pre-JEE/NEET)",
    "class 10": "Foundation & Olympiad Program (Class 9 & 10 Pre-JEE/NEET)",
    "ntse": "Foundation & Olympiad Program (Class 9 & 10 Pre-JEE/NEET)",

    # Backward compatibility aliases
    "python": "Python Programming Masterclass",
    "python programming": "Python Programming Masterclass",
    "masterclass": "Python Programming Masterclass",
    "web": "Full Stack Web Development",
    "web dev": "Full Stack Web Development",
    "web development": "Full Stack Web Development",
    "full stack": "Full Stack Web Development",
    "fullstack": "Full Stack Web Development",
    "react": "Full Stack Web Development",
    "node": "Full Stack Web Development",
    "data science": "Data Science & Machine Learning",
    "data analyst": "Data Science & Machine Learning",
    "machine learning": "Data Science & Machine Learning",
    "ml": "Data Science & Machine Learning",
    "ai": "AI & Deep Learning Specialist",
    "artificial intelligence": "AI & Deep Learning Specialist",
    "deep learning": "AI & Deep Learning Specialist",
    "devops": "DevOps & Cloud Engineering",
    "cloud": "DevOps & Cloud Engineering",
    "aws": "DevOps & Cloud Engineering"
}


INTENT_PATTERNS = [
    # Human Escalation / Support
    (r"\b(talk to a person|speak to someone|talk to a counselor|need a human|human support|speak to human|real agent|connect to human|human counselor)\b", "human_support", 0.95),

    # AI Identity
    (r"\b(who are you|are you a real person|are you human|are you an ai|are you bot|are you a bot|what are you|who created you)\b", "identity", 0.95),

    # How Are You
    (r"\b(how are you|how are u|how's it going|how do you do)\b", "how_are_you", 0.95),

    # Help & Capabilities
    (r"\b(what can you help|what can you do|can you help me|help me|capabilities|^help$)\b", "help", 0.95),

    # Thanks & Gratitude
    (r"\b(thanks|thank you|thx|thank u|appreciate it)\b", "thanks", 0.95),

    # Goodbye & Farewell
    (r"\b(bye|goodbye|see you|have a good day|farewell)\b", "goodbye", 0.95),

    # Acknowledgement / Confirmation
    (r"^(okay|ok|sure|got it|fine|cool|alright)$", "acknowledgement", 0.95),

    # Time-specific Greetings
    (r"\bgood morning\b", "greeting_morning", 0.95),
    (r"\bgood afternoon\b", "greeting_afternoon", 0.95),
    (r"\bgood evening\b", "greeting_evening", 0.95),

    # General Greetings
    (r"^(hi|hello|hey|greetings|hi there|hello there|hey there)$", "greeting", 0.95),

    # Clarification / Confusion
    (r"\b(i don't understand|what do you mean|don't get it|confused)\b", "clarification_needed", 0.90),

    # Callback / Lead collection
    (r"\b(call me|callback|call back|contact me|reach me|counseling call|phone number)\b", "callback", 0.95),
    
    # Complaint
    (r"\b(unhappy|dissatisfied|disappointed|complaint|complain|bad service|worst|terrible|issue with class)\b", "complaint", 0.90),
    
    # Course Recommendation / Guidance
    (r"\b(don't know|not sure|which course|what course should|recommend|suggest|guidance|beginner|help me choose|fit for me|right for me|interested in|want to learn|looking to learn)\b", "course_recommendation", 0.92),
    
    # Pricing / Cost / Fee / Installments / Scholarship
    (r"\b(fee|fees|cost|price|pricing|charge|charges|how much|tuition|installment|installments|scholarship|scholarships|atse|discount|concession)\b", "pricing", 0.92),
    
    # Course Duration / Timings
    (r"\b(duration|how long|length|weeks|hours|time period|years|year)\b", "course_duration", 0.90),
    
    # Eligibility / Prerequisites
    (r"\b(eligibility|eligible|prerequisite|prerequisites|requirements|qualification|prior experience|need experience)\b", "eligibility", 0.90),
    
    # Schedule / Timings / Batches
    (r"\b(schedule|timings|timing|batch|batches|class time|when are classes|class hours|today's schedule|morning batch|evening batch|weekend batch)\b", "schedule", 0.90),
    
    # Online vs Offline Mode / Missed Class
    (r"\b(online|offline|remote|classroom|in person|virtual|live class|miss a live class|missed class)\b", "online_learning", 0.88),
    
    # Documents
    (r"\b(documents|document|id proof|marksheet|paperwork|certificates required)\b", "documents", 0.90),
    
    # Admission
    (r"\b(admission|apply|enroll|enrollment|join|joining|how to apply)\b", "admission", 0.90),
    
    # Refund & Cancellation
    (r"\b(refund|money back|return money)\b", "refund", 0.92),
    (r"\b(cancel|cancellation|withdraw)\b", "cancellation", 0.90),

    # Placement & Career
    (r"\b(placement|job|career|interview|resume|hiring)\b", "course_information", 0.88),

    # Policies / Certification / Attendance
    (r"\b(attendance|certificate|certification|policy|policies|rules)\b", "course_information", 0.88),
    
    # Facilities
    (r"\b(facility|facilities|lab|library|portal|computer|infrastructure)\b", "facilities", 0.88),
    
    # General Contact / Location
    (r"\b(where|location|address|phone|email|contact|working hours|open)\b", "contact", 0.88),
    
    # Course Information General
    (r"\b(courses|course|curriculum|syllabus|subjects|teach|learn|programs)\b", "course_information", 0.85)
]

UNRELATED_KEYWORDS = [
    "football", "cricket", "soccer", "movie", "weather", "president",
    "politics", "recipe", "song", "game", "restaurant", "pizza", "car", "flight"
]

class IntentDetector:
    def detect(self, user_message: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        text = user_message.strip().lower()
        
        # Extract potential entities (phone, email, name, course)
        entities = self._extract_entities(user_message)

        # 1. Short generic ambiguous queries like "How much?" or "How long?" without context
        if text in ["how much?", "how much", "cost?", "price?"] and not self._has_active_course_in_history(history):
            return {
                "intent": "clarification_needed",
                "confidence": 0.90,
                "entities": entities,
                "reason": "Ambiguous pricing question without target course"
            }

        # 2. Check for lead capture input (if user provided name or phone number directly)
        if entities.get("phone") or (entities.get("name") and len(text.split()) <= 4 and not any(k in text for k in ["hi", "hello", "hey", "thanks", "bye"])):
            return {
                "intent": "callback",
                "confidence": 0.95,
                "entities": entities
            }

        # 3. Check for obvious unrelated topics
        for kw in UNRELATED_KEYWORDS:
            if re.search(r"\b" + re.escape(kw) + r"\b", text):
                return {
                    "intent": "unrelated",
                    "confidence": 0.95,
                    "entities": entities
                }

        # 4. Match rule-based intent patterns
        best_intent = "unknown_business_question"
        best_confidence = 0.40

        for pattern, intent_name, conf in INTENT_PATTERNS:
            if re.search(pattern, text):
                best_intent = intent_name
                best_confidence = conf
                break

        # Special check: If user mentions an explicit course and pricing/duration words
        if entities.get("course"):
            if "fee" in text or "cost" in text or "price" in text or "how much" in text:
                best_intent = "pricing"
                best_confidence = 0.95
            elif "long" in text or "duration" in text or "weeks" in text:
                best_intent = "course_duration"
                best_confidence = 0.95

        return {
            "intent": best_intent,
            "confidence": round(best_confidence, 2),
            "entities": entities
        }

    def get_active_course_aliases(self) -> Dict[str, str]:
        aliases = dict(COURSE_ALIASES)
        courses = profile_manager.courses
        for c in courses:
            c_name = c.get("name")
            if c_name:
                aliases[c_name.lower()] = c_name
                words = [w for w in c_name.lower().split() if len(w) > 2 and w not in ["course", "masterclass", "development", "training", "program", "specialist", "engineering"]]
                for w in words:
                    if w not in aliases:
                        aliases[w] = c_name
        return aliases

    def _extract_entities(self, text: str) -> Dict[str, Any]:
        entities = {}
        
        # Phone number pattern (e.g. 9999999999 or +1 800 555 0199 or 10 digits)
        phone_match = re.search(r"(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\b\d{10}\b", text)
        if phone_match:
            entities["phone"] = phone_match.group(0).strip()

        # Email pattern
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
        if email_match:
            entities["email"] = email_match.group(0).strip()

        # Name pattern heuristic ("my name is X" or "I am X")
        name_match = re.search(r"(?:my name is|i am|this is)\s+([a-zA-Z]+)", text, re.IGNORECASE)
        if name_match:
            entities["name"] = name_match.group(1).capitalize()

        # Course extraction
        lower_text = text.lower()
        active_aliases = self.get_active_course_aliases()
        for alias, full_course_name in active_aliases.items():
            if re.search(r"\b" + re.escape(alias) + r"\b", lower_text):
                entities["course"] = full_course_name
                break

        return entities

    def _has_active_course_in_history(self, history: Optional[List[Dict[str, str]]]) -> bool:
        if not history:
            return False
        active_aliases = self.get_active_course_aliases()
        for msg in reversed(history):
            content = msg.get("content", "").lower()
            for alias in active_aliases:
                if alias in content:
                    return True
        return False


intent_detector = IntentDetector()

