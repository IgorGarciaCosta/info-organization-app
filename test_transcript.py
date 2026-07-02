"""
Isolated test for the youtube-transcript-api library.

Usage:
    python test_transcript.py                 # uses a sample video
    python test_transcript.py <URL_or_ID>     # test with any video you want

Goal: confirm the library can access and return a transcript BEFORE building the app.
"""

import re
import sys


def extrair_video_id(url_ou_id: str) -> str:
    """Accepts a full URL (several formats) or the raw ID and returns the ID."""
    # Already looks like an ID (11 characters, no slashes)
    if re.fullmatch(r"[0-9A-Za-z_-]{11}", url_ou_id):
        return url_ou_id

    padroes = [
        r"(?:v=|/v/|youtu\.be/|/embed/|/shorts/)([0-9A-Za-z_-]{11})",
    ]
    for padrao in padroes:
        m = re.search(padrao, url_ou_id)
        if m:
            return m.group(1)

    raise ValueError(f"Could not extract the video ID from: {url_ou_id!r}")


def buscar_transcricao(video_id: str, idiomas=("pt", "pt-BR", "en")):
    """
    Fetches the transcript. Compatible with both the new API (>=1.0) and the old
    API (<1.0) of the youtube-transcript-api library.
    """
    from youtube_transcript_api import YouTubeTranscriptApi

    # New API (>= 1.0): instance + .fetch()
    if hasattr(YouTubeTranscriptApi, "fetch") or callable(getattr(YouTubeTranscriptApi(), "fetch", None)):
        try:
            api = YouTubeTranscriptApi()
            fetched = api.fetch(video_id, languages=list(idiomas))
            # fetched is an iterable of snippets with .text / .start / .duration
            return [
                {"text": s.text, "start": s.start, "duration": s.duration}
                for s in fetched
            ]
        except AttributeError:
            pass  # fall back to the old mode below

    # Old API (< 1.0): static method get_transcript()
    return YouTubeTranscriptApi.get_transcript(video_id, languages=list(idiomas))


def main() -> int:
    # Sample video (feel free to change). This is a public TED-Ed talk with captions.
    entrada = sys.argv[1] if len(
        sys.argv) > 1 else "https://www.youtube.com/watch?v=arj7oStGLkU"

    try:
        video_id = extrair_video_id(entrada)
    except ValueError as e:
        print(f"[ERROR] {e}")
        return 1

    print(f"Video ID: {video_id}")
    print("Fetching transcript (pt, pt-BR, en)...\n")

    try:
        segmentos = buscar_transcricao(video_id)
    except Exception as e:
        print(
            f"[FAILED] Could not fetch the transcript: {type(e).__name__}: {e}")
        return 2

    texto_completo = " ".join(seg["text"] for seg in segmentos)

    print(f"[OK] Segments received: {len(segmentos)}")
    print(f"[OK] Text length: {len(texto_completo)} characters\n")
    print("--- Transcription ---")
    print(texto_completo)
    print("---------------------------------")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
