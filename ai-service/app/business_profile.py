import os
import json
import logging
from typing import Dict, Any, List, Tuple, Optional, Union

logger = logging.getLogger("BusinessProfile")

DEFAULT_PROFILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../knowledge/business.json")
)

def validate_business_profile(data: Any) -> Tuple[bool, List[str]]:
    """
    Validates a business profile dictionary.
    Returns (is_valid, list_of_error_messages).
    """
    errors = []
    if not isinstance(data, dict):
        return False, ["Business profile payload must be a valid JSON object/dictionary."]

    bus = data.get("business")
    if not bus or not isinstance(bus, dict):
        errors.append("Required field 'business' object is missing or invalid.")
    else:
        name = bus.get("name")
        if not name or not isinstance(name, str) or not name.strip():
            errors.append("Required field 'business.name' must be a non-empty string.")

    courses = data.get("courses")
    if courses is not None and not isinstance(courses, list):
        errors.append("Optional field 'courses' must be a list of course objects if provided.")

    faqs = data.get("faq")
    if faqs is not None and not isinstance(faqs, list):
        errors.append("Optional field 'faq' must be a list of FAQ objects if provided.")

    return len(errors) == 0, errors


class BusinessProfileManager:
    """
    Central manager for loading, validating, and serving the active business profile.
    Supports switching profiles dynamically for future multi-business support.
    """
    def __init__(self, profile_target: Optional[Union[str, Dict[str, Any]]] = None):
        self.profile_path = DEFAULT_PROFILE_PATH
        self.raw_data: Dict[str, Any] = {}
        self.load_profile(profile_target or self.profile_path)

    def load_profile(self, target: Optional[Union[str, Dict[str, Any]]] = None) -> bool:
        if target is None:
            target = self.profile_path

        if isinstance(target, dict):
            is_valid, errors = validate_business_profile(target)
            if not is_valid:
                logger.error(f"[BusinessProfile Error] Invalid profile object provided: {errors}")
                return False
            self.raw_data = target
            return True

        if isinstance(target, str):
            self.profile_path = os.path.abspath(target)
            if not os.path.exists(self.profile_path):
                logger.error(f"[BusinessProfile Error] Profile file not found at: {self.profile_path}")
                return False

            try:
                with open(self.profile_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                is_valid, errors = validate_business_profile(data)
                if not is_valid:
                    logger.error(f"[BusinessProfile Error] Validation failed for file {self.profile_path}: {errors}")
                    return False

                self.raw_data = data
                return True
            except Exception as e:
                logger.error(f"[BusinessProfile Error] Failed to read profile JSON: {e}")
                return False

        logger.error(f"[BusinessProfile Error] Unsupported target type: {type(target)}")
        return False

    @property
    def business_name(self) -> str:
        bus = self.raw_data.get("business", {})
        return bus.get("name", "our business")

    @property
    def tagline(self) -> str:
        bus = self.raw_data.get("business", {})
        return bus.get("tagline", "")

    @property
    def description(self) -> str:
        bus = self.raw_data.get("business", {})
        return bus.get("description", "")

    @property
    def courses(self) -> List[Dict[str, Any]]:
        return self.raw_data.get("courses", [])

    @property
    def contact_info(self) -> Dict[str, Any]:
        bus = self.raw_data.get("business", {})
        cnt = self.raw_data.get("contact", {})
        return {
            "phone": cnt.get("phone") or bus.get("phone", ""),
            "email": cnt.get("email") or bus.get("email", ""),
            "address": cnt.get("address") or bus.get("location", ""),
            "call_back_policy": cnt.get("call_back_policy", "")
        }

    @property
    def working_hours(self) -> str:
        bus = self.raw_data.get("business", {})
        return bus.get("working_hours", "")

    @property
    def faqs(self) -> List[Dict[str, Any]]:
        return self.raw_data.get("faq", [])


profile_manager = BusinessProfileManager()
