"""
Gemini implementation of the AIService interface.

Architecture note (why this lives in the backend):
The Gemini API requires a secret API key. If that key were shipped inside the
mobile app it could be extracted from the installed bundle. Keeping every AI
call here, on the server, means the key never leaves the backend and the prompt
("what to do with the text") can be changed without republishing the app.
"""

from __future__ import annotations

import os

from google import genai

from .base import AIService, ContentAnalysis

# The prompt defines the analysis task while ContentAnalysis defines its format.
ANALYSIS_INSTRUCTION = (
    "Analyze the transcript and provide the entire analysis in English. Create a "
    "title and subtitle, identify the theme and genre, and extract the key topics. "
    "Explain each topic objectively and classify its importance. Order the topics "
    "from most to least important. Do not invent information that is absent from "
    "the transcript.\n\nTranscript:\n"
)

# Best free-tier model as of the current Gemini docs: the stable flagship Flash
# model, which offers free input/output tokens for text tasks like this one.
DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite"


class AIServiceGemini(AIService):
    """
    Concrete AIService implementation backed by Google's Gemini API.

    The API key is read from the GEMINI_API_KEY environment variable by the
    genai client, so no secret is hard-coded here.
    """

    def __init__(self, model: str = DEFAULT_GEMINI_MODEL) -> None:
        # Fail early with a clear message if the key is missing, instead of a
        # confusing error deep inside the SDK on the first request.
        if not os.environ.get("GEMINI_API_KEY"):
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Create a .env file with "
                "GEMINI_API_KEY=your_key (see .env.example)."
            )

        # The client automatically picks up GEMINI_API_KEY from the environment.
        self._client = genai.Client()
        self._model = model

    def send_transcription_to_model(self, transcription: str) -> ContentAnalysis:
        """Ask Gemini for schema-constrained JSON and validate the response."""
        prompt = f"{ANALYSIS_INSTRUCTION}{transcription}"

        interaction = self._client.interactions.create(
            model=self._model,
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": ContentAnalysis.model_json_schema(),
            },
        )

        # Validate even schema-constrained model output before exposing it publicly.
        return ContentAnalysis.model_validate_json(interaction.output_text)
