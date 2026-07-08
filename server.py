"""
FastAPI backend that exposes the YouTube transcript logic over HTTP.

The mobile app cannot run Python, so it calls this small API instead. We reuse
the functions already validated in test_transcript.py (extrair_video_id and
buscar_transcricao) so there is a single source of truth for the logic.

Run it with:
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

from test_transcript import buscar_transcricao, extrair_video_id
from ai_services import get_ai_service
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables (like GEMINI_API_KEY) from a local .env file before
# anything else needs them. This is what keeps the secret key out of the code.
load_dotenv()

# Reuse the exact logic that was already validated in the standalone script.

app = FastAPI(title="Transcript API")

# Allow requests from any origin. The Expo app runs on a different device/origin,
# so without this the browser/runtime would block the call (CORS policy).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranscriptRequest(BaseModel):
    """Incoming payload: the raw YouTube URL or the 11-char video ID."""

    url: str


class TranscriptResponse(BaseModel):
    """Outgoing payload: the resolved video id plus the full transcript text."""

    video_id: str
    text: str


class SummarizeRequest(BaseModel):
    """Incoming payload: the transcript text to be processed by the AI model."""

    text: str


class SummarizeResponse(BaseModel):
    """Outgoing payload: the short summary produced by the AI model."""

    summary: str


@app.get("/health")
def health():
    """Simple endpoint to confirm the server is reachable from the phone."""
    return {"status": "ok"}


@app.post("/transcript", response_model=TranscriptResponse)
def get_transcript(payload: TranscriptRequest):
    """Resolve the video id, fetch its transcript and return it as plain text."""
    # 1) Turn the URL/ID into a clean 11-character video id (or fail with 400).
    try:
        video_id = extrair_video_id(payload.url.strip())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    # 2) Fetch the transcript segments; surface any library error as a 502.
    try:
        segments = buscar_transcricao(video_id)
    except Exception as error:  # noqa: BLE001 - report any failure to the client
        raise HTTPException(
            status_code=502, detail=f"{type(error).__name__}: {error}"
        )

    # 3) Join the individual caption snippets into one readable block of text.
    text = " ".join(segment["text"] for segment in segments)
    return TranscriptResponse(video_id=video_id, text=text)


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(payload: SummarizeRequest):
    """Send the transcript to the AI model and return a short summary."""
    # 1) Reject empty input early with a clear 400 error.
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="O texto está vazio.")

    # 2) Delegate to the AI service; report any failure (missing key, model
    #    error, network issue) as a 502 with a readable message.
    try:
        service = get_ai_service()
        summary = service.send_transcription_to_model(text)
    except Exception as error:  # noqa: BLE001 - report any failure to the client
        raise HTTPException(
            status_code=502, detail=f"{type(error).__name__}: {error}"
        )

    return SummarizeResponse(summary=summary)
