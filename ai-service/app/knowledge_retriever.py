import json
import os
import re
from typing import List, Dict, Any, Tuple

from app.business_profile import profile_manager, BusinessProfileManager, DEFAULT_PROFILE_PATH

DEFAULT_KNOWLEDGE_PATH = DEFAULT_PROFILE_PATH


STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "can", "could", "would",
    "should", "will", "shall", "may", "might", "must", "i", "you", "he",
    "she", "it", "we", "they", "me", "him", "her", "us", "them", "my",
    "your", "his", "its", "our", "their", "this", "that", "these", "those",
    "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
    "of", "in", "to", "for", "with", "on", "at", "from", "by", "about",
    "as", "into", "like", "through", "after", "over", "between", "out",
    "against", "during", "without", "before", "under", "around", "among"
}

SYNONYMS = {
    "cost": ["fee", "fees", "price", "pricing", "tuition", "charge", "rates", "payment", "installment"],
    "fee": ["cost", "fees", "price", "pricing", "tuition", "charge", "rates", "installment"],
    "fees": ["cost", "fee", "price", "pricing", "tuition", "charge", "rates", "installment"],
    "price": ["cost", "fee", "fees", "pricing", "tuition", "charge"],
    "location": ["address", "located", "where", "place", "site", "campus", "venue"],
    "located": ["location", "address", "where", "place", "site", "campus"],
    "address": ["location", "located", "where", "place", "site"],
    "duration": ["length", "long", "weeks", "hours", "period", "time"],
    "long": ["duration", "length", "weeks", "hours", "period"],
    "time": ["timings", "hours", "schedule", "timing", "duration"],
    "hours": ["working_hours", "open", "timings", "schedule", "time"],
    "documents": ["document", "id", "paperwork", "certificate", "marksheets", "proof"],
    "admission": ["apply", "admission", "enroll", "enrollment", "join", "joining"],
    "apply": ["admission", "enroll", "enrollment", "join", "process"],
    "call": ["callback", "phone", "contact", "talk", "reach", "speak", "number"],
    "phone": ["call", "callback", "contact", "number", "reach"],
    "refund": ["cancellation", "cancel", "money back", "return", "policy"],
    "cancel": ["refund", "cancellation", "policy"],
    "online": ["mode", "virtual", "remote", "live"],
    "offline": ["classroom", "in-person", "campus"],
    "courses": ["course", "programs", "program", "classes", "curriculum", "subjects"],
    "course": ["courses", "program", "class", "curriculum", "subject", "options", "guidance"],
    "eligibility": ["eligible", "requirements", "requirement", "prerequisites", "qualification", "criteria"],
    "requirements": ["eligibility", "eligible", "requirement", "prerequisites", "qualification", "criteria"],
    "prerequisites": ["eligibility", "eligible", "requirements", "requirement", "qualification"],
    "know": ["understand", "choose", "select", "recommendation", "guidance", "help"],
    "right": ["suitable", "best", "appropriate", "fit", "choose"],
    "placement": ["job", "career", "interview", "resume", "hiring", "work"],
    "job": ["placement", "career", "interview", "work", "hiring"]
}


class LocalKnowledgeRetriever:
    def __init__(self, json_path: str = DEFAULT_KNOWLEDGE_PATH):
        self.json_path = json_path
        self.raw_data = {}
        self.chunks = []
        self.load_and_index()

    def load_and_index(self):
        """Loads business.json and parses structured sections into knowledge chunks."""
        if not os.path.exists(self.json_path):
            print(f"[Retriever Warning] Knowledge file not found at {self.json_path}")
            return

        with open(self.json_path, "r", encoding="utf-8") as f:
            self.raw_data = json.load(f)

        self.chunks = self._build_chunks(self.raw_data)

    def _build_chunks(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        chunks = []

        # 1. Business Info & Location
        bus = data.get("business", {})
        if bus:
            content = (
                f"Business Name: {bus.get('name')}\n"
                f"Tagline: {bus.get('tagline', '')}\n"
                f"Description: {bus.get('description')}\n"
                f"Location / Address: {bus.get('location')}\n"
                f"Phone: {bus.get('phone')}\n"
                f"Email: {bus.get('email')}\n"
                f"Working Hours: {bus.get('working_hours')}"
            )
            chunks.append({
                "id": "business_info",
                "title": "Business Contact & Location Information",
                "category": "business",
                "content": content,
                "keywords": ["name", "address", "location", "where", "phone", "contact", "email", "working", "hours", "open", "timing", "located"]
            })

        # 2. Individual Courses
        courses = data.get("courses", [])
        all_course_names = []
        eligibility_summary = []
        for course in courses:
            c_name = course.get("name", "")
            all_course_names.append(c_name)
            elig_str = course.get("eligibility", "None")
            eligibility_summary.append(f"- {c_name}: {elig_str}")
            modes_str = ", ".join(course.get("mode", [])) if isinstance(course.get("mode"), list) else str(course.get("mode"))
            content = (
                f"Course Name: {c_name}\n"
                f"Description: {course.get('description')}\n"
                f"Duration: {course.get('duration')}\n"
                f"Fee: {course.get('fee')}\n"
                f"Eligibility: {elig_str}\n"
                f"Learning Modes: {modes_str}\n"
                f"Class Timings: {course.get('class_timings')}\n"
                f"Prerequisites: {course.get('prerequisites', 'None')}\n"
                f"Career Outcomes: {course.get('career_outcomes', '')}"
            )
            c_keywords = self._extract_tokens(f"{c_name} {course.get('description')} fee cost price duration eligibility requirements requirement prerequisites mode timings outcomes career")
            chunks.append({
                "id": f"course_{course.get('id', c_name)}",
                "title": f"Course: {c_name}",
                "category": "course",
                "course_name": c_name,
                "content": content,
                "keywords": c_keywords
            })

        # 3. All Courses Summary Chunk
        bus_name = bus.get("name", "our business")
        if all_course_names:
            summary_content = f"{bus_name} offers the following courses:\n" + "\n".join([f"- {c['name']}: {c['fee']} ({c['duration']})" for c in courses]) + "\n\nWe assist students in choosing the right course based on their career goals."
            chunks.append({
                "id": "courses_summary",
                "title": "All Available Courses Overview",
                "category": "courses_overview",
                "content": summary_content,
                "keywords": ["courses", "offer", "offered", "programs", "available", "list", "curriculum", "classes", "catalog", "guidance", "choose", "select", "right", "fit", "suitable"]
            })

        # 4. Course Comparison & Recommendation Chunk
        comp = data.get("course_comparison", {})
        if comp:
            comp_content = (
                f"Course Comparison & Guidance:\n"
                f"- For Beginners: {comp.get('beginner_options', '')}\n"
                f"- Web vs Data Science: {comp.get('web_vs_data', '')}\n"
                f"- AI Prerequisites: {comp.get('ai_prerequisite', '')}"
            )
            chunks.append({
                "id": "course_comparison_info",
                "title": "Course Comparison & Recommendation Guidance",
                "category": "recommendation",
                "content": comp_content,
                "keywords": ["recommendation", "choose", "select", "which", "beginner", "compare", "comparison", "right", "suitable", "fit", "guidance", "help"]
            })

        # 5. Career & Placement Support
        car = data.get("career_and_placement", {})
        if car:
            car_content = (
                f"Career Services & Job Support:\n"
                f"- Services: {car.get('placement_support', '')}\n"
                f"- Counseling: {car.get('career_counseling', '')}\n"
                f"- Policy: {car.get('guarantee_disclaimer', '')}"
            )
            chunks.append({
                "id": "career_placement_info",
                "title": "Career Services & Placement Assistance",
                "category": "career",
                "content": car_content,
                "keywords": ["placement", "job", "career", "interview", "resume", "guidance", "counseling", "referrals"]
            })

        # 6. General Course Eligibility Requirements Chunk
        if eligibility_summary:
            elig_content = "Course Eligibility Requirements & Prerequisites:\n" + "\n".join(eligibility_summary)
            chunks.append({
                "id": "course_eligibility_summary",
                "title": "Course Eligibility Requirements & Prerequisites",
                "category": "eligibility",
                "content": elig_content,
                "keywords": ["eligibility", "eligible", "requirements", "requirement", "prerequisites", "qualification", "criteria"]
            })

        # 7. Admission Process & Documents & Installments
        adm = data.get("admission", {})
        if adm:
            proc_str = "\n".join([f"{i+1}. {p}" for i, p in enumerate(adm.get("process", []))])
            docs_str = "\n".join([f"- {d}" for d in adm.get("documents_required", [])])
            content = (
                f"Admission Process:\n{proc_str}\n\n"
                f"Required Documents for Admission:\n{docs_str}\n\n"
                f"Installment Options: {adm.get('installment_options', '')}"
            )
            chunks.append({
                "id": "admission_info",
                "title": "Admission Process, Required Documents & Installments",
                "category": "admission",
                "content": content,
                "keywords": ["admission", "process", "apply", "documents", "required", "id", "marksheet", "enrollment", "join", "paperwork", "installment", "pay"]
            })

        # 8. Refund & Cancellation
        ref = data.get("refund_cancellation", {})
        if ref:
            content = f"Refund & Cancellation Policy:\n{ref.get('policy')}\n\nCancellation Info: {ref.get('cancellation', '')}"
            chunks.append({
                "id": "refund_policy",
                "title": "Refund and Cancellation Policy",
                "category": "refund",
                "content": content,
                "keywords": ["refund", "cancellation", "cancel", "money back", "return", "policy", "fees refund", "withdraw"]
            })

        # 9. General Policies
        pols = data.get("policies", {})
        if pols:
            content = (
                f"General {bus_name} Policies:\n"
                f"- Attendance: {pols.get('attendance_policy', '')}\n"
                f"- Certification: {pols.get('certification', '')}\n"
                f"- Code of Conduct: {pols.get('code_of_conduct', '')}"
            )
            chunks.append({
                "id": "academy_policies",
                "title": "Academy Policies (Attendance & Certification)",
                "category": "policies",
                "content": content,
                "keywords": ["attendance", "certificate", "certification", "conduct", "policy", "policies", "rules", "passing"]
            })

        # 10. Contact & Callback Policy
        cnt = data.get("contact", {})
        if cnt or bus:
            content = (
                f"Callback Policy: {cnt.get('call_back_policy', '')}\n"
                f"Direct Phone: {bus.get('phone')}\n"
                f"Direct Email: {bus.get('email')}"
            )
            chunks.append({
                "id": "contact_callback",
                "title": "Customer Callback & Contact Policy",
                "category": "contact",
                "content": content,
                "keywords": ["call", "callback", "phone", "contact", "counselor", "speak", "talk", "number", "agent", "reach"]
            })

        # 11. Facilities
        fac = data.get("facilities", [])
        if fac:
            content = "Campus Facilities & Amenities:\n" + "\n".join([f"- {item}" for item in fac])
            chunks.append({
                "id": "facilities_info",
                "title": "Campus Facilities & Resources",
                "category": "facilities",
                "content": content,
                "keywords": ["facilities", "facility", "lab", "library", "portal", "amenities", "infrastructure", "sandbox"]
            })

        # 12. FAQs
        faqs = data.get("faq", [])
        for idx, item in enumerate(faqs):
            q_text = item.get("question", "")
            a_text = item.get("answer", "")
            chunks.append({
                "id": f"faq_{idx}",
                "title": f"FAQ: {q_text}",
                "category": "faq",
                "content": f"Q: {q_text}\nA: {a_text}",
                "keywords": self._extract_tokens(f"{q_text} {a_text}")
            })

        return chunks

    def _extract_tokens(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [t for t in cleaned.split() if t and t not in STOP_WORDS]
        return tokens

    def _expand_query_tokens(self, tokens: List[str]) -> List[str]:
        expanded = set(tokens)
        for t in tokens:
            if t in SYNONYMS:
                for syn in SYNONYMS[t]:
                    expanded.add(syn)
        return list(expanded)

    def score_chunk(self, query_raw: str, chunk: Dict[str, Any]) -> float:
        query_tokens = self._extract_tokens(query_raw)
        if not query_tokens:
            return 0.0

        expanded_tokens = set(self._expand_query_tokens(query_tokens))
        chunk_title_tokens = set(self._extract_tokens(chunk.get("title", "")))
        chunk_content_tokens = set(self._extract_tokens(chunk.get("content", "")))
        chunk_keywords = set(chunk.get("keywords", []))

        all_index_tokens = set()
        for c in self.chunks:
            all_index_tokens.update(c.get("keywords", []))
            all_index_tokens.update(self._extract_tokens(c.get("content", "")))

        out_of_domain_terms = [t for t in query_tokens if t not in all_index_tokens and t not in SYNONYMS]

        # 1. Exact token matches in chunk content/title/keywords
        title_matches = len(expanded_tokens.intersection(chunk_title_tokens))
        content_matches = len(expanded_tokens.intersection(chunk_content_tokens))
        keyword_matches = len(expanded_tokens.intersection(chunk_keywords))

        # 2. Key entity matching (e.g. course names)
        course_name = chunk.get("course_name", "").lower()
        course_boost = 0.0
        if course_name:
            for qt in query_tokens:
                if qt in course_name:
                    course_boost += 0.45

        # 3. Calculate raw overlap score
        total_unique_query_tokens = len(query_tokens)

        score = (
            (title_matches * 0.35) +
            (keyword_matches * 0.30) +
            (content_matches * 0.15) +
            course_boost
        ) / float(total_unique_query_tokens)

        if out_of_domain_terms and len(out_of_domain_terms) == len(query_tokens):
            score = 0.0
        elif out_of_domain_terms and "course" in query_tokens:
            score = score * 0.3

        return min(1.0, round(score, 2))

    def retrieve_context(self, query: str, top_k: int = 3, min_threshold: float = 0.25) -> List[Dict[str, Any]]:
        """
        Retrieves top_k relevant knowledge chunks for a query.
        Returns a list of dicts with title, content, score, and category.
        """
        self.load_and_index()

        scored_chunks = []
        for chunk in self.chunks:
            score = self.score_chunk(query, chunk)
            scored_chunks.append({
                "title": chunk["title"],
                "content": chunk["content"],
                "category": chunk.get("category", "general"),
                "score": score
            })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        top_chunks = scored_chunks[:top_k]

        return top_chunks

    def get_business_name(self) -> str:
        bus = self.raw_data.get("business", {})
        return bus.get("name", "our business")


_retriever = LocalKnowledgeRetriever()

def retrieve_context(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    return _retriever.retrieve_context(query=query, top_k=top_k)

def get_business_name() -> str:
    return _retriever.get_business_name()

