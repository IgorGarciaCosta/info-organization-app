"""Public access to the structured Gemini analysis service."""

from __future__ import annotations

from functools import cache

from .base import ContentAnalysis
from .gemini import AIServiceGemini


@cache
def get_ai_service() -> AIServiceGemini:
    """Return the shared Gemini client, creating it only on first use."""
    return AIServiceGemini()
