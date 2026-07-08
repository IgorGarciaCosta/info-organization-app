"""
AI service interface (the "contract").

This module contains ONLY the abstract definition of what an AI service must do,
with no vendor-specific code. The rest of the app depends on this interface, not
on any concrete provider, so implementations (Gemini, OpenAI, a local model...)
can be swapped without touching the callers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class AIService(ABC):
    """
    Interface for any AI backend able to process a transcription.

    Implementations receive the plain transcription text, combine it with an
    instruction prompt, send it to a model and return the model's answer.
    """

    @abstractmethod
    def send_transcription_to_model(self, transcription: str) -> str:
        """Send the transcription to the model and return its text response."""
        raise NotImplementedError
