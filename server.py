"""
FastAPI backend that exposes the YouTube transcript logic over HTTP.

The mobile app cannot run Python, so it calls this small API instead. We reuse
the functions already validated in test_transcript.py (extrair_video_id and
buscar_transcricao) so there is a single source of truth for the logic.

Run it with:
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Reuse the exact logic that was already validated in the standalone script.
from test_transcript import buscar_transcricao, extrair_video_id

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
