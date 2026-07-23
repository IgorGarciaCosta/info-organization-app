"""
FastAPI backend that exposes Gemini transcript analysis over HTTP.

The mobile app retrieves captions on-device and sends only their text here,
keeping the Gemini API key out of the installed application.

Run it with:
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

from ai_services import ContentAnalysis, get_ai_service
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables (like GEMINI_API_KEY) from a local .env file before
# anything else needs them. This is what keeps the secret key out of the code.
load_dotenv()

app = FastAPI(title="Transcript API")

# Allow requests from any origin. The Expo app runs on a different device/origin,
# so without this the browser/runtime would block the call (CORS policy).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SummarizeRequest(BaseModel):
    """Incoming payload: the transcript text to be processed by the AI model."""

    text: str


@app.get("/health")
def health():
    """Simple endpoint to confirm the server is reachable from the phone."""
    return {"status": "ok"}


@app.post("/summarize", response_model=ContentAnalysis)
def summarize(payload: SummarizeRequest):
    """Send the transcript to the AI model and return structured analysis."""
    # 1) Reject empty input early with a clear 400 error.
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is empty.")

    # 2) Delegate to the AI service; report any failure (missing key, model
    #    error, network issue) as a 502 with a readable message.
    try:
        service = get_ai_service()
        analysis = service.send_transcription_to_model(text)
    except Exception as error:  # noqa: BLE001 - report any failure to the client
        raise HTTPException(
            status_code=502, detail=f"{type(error).__name__}: {error}"
        )

    return analysis
