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

from .base import AIService

# Instruction prompt sent together with the transcription. For now it only asks
# for a short summary (max 5 lines) in Portuguese. Changing the product's
# behaviour later is as easy as editing this constant.
SUMMARY_INSTRUCTION = (
    "Você é um assistente que resume conteúdos. Resuma a transcrição abaixo em "
    "português, em um texto curto de no máximo 5 linhas. Responda apenas com o "
    "resumo, sem títulos nem comentários extras.\n\n"
    "Transcrição:\n"
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
                "GEMINI_API_KEY não está definida. Crie um arquivo .env com "
                "GEMINI_API_KEY=sua_chave (veja .env.example)."
            )

        # The client automatically picks up GEMINI_API_KEY from the environment.
        self._client = genai.Client()
        self._model = model

    def send_transcription_to_model(self, transcription: str) -> str:
        """Prepend the instruction prompt to the text and return the summary."""
        prompt = f"{SUMMARY_INSTRUCTION}{transcription}"

        interaction = self._client.interactions.create(
            model=self._model,
            input=prompt,
        )

        # `output_text` is the SDK convenience property with the final answer.
        return interaction.output_text.strip()
