"""
AI services package.

Exposes the AIService interface, the concrete implementations, and a factory
(`get_ai_service`) that returns the implementation the app should use. Callers
only import from this package, so switching providers is a one-line change here.
"""

from __future__ import annotations

from .base import AIService, ContentAnalysis, Topic
from .gemini import AIServiceGemini

# Cached singleton so we build the Gemini client only once, lazily. Building it
# on first use (not at import time) keeps the server able to start even before
# the API key is configured.
_service_singleton: AIService | None = None


def get_ai_service() -> AIService:
    """Return the shared AIService instance, creating it on first use."""
    global _service_singleton
    if _service_singleton is None:
        _service_singleton = AIServiceGemini()
    return _service_singleton


__all__ = ["AIService", "AIServiceGemini", "ContentAnalysis", "Topic", "get_ai_service"]
