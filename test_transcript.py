"""
Isolated test for the youtube-transcript-api library.

Usage:
    python test_transcript.py                 # uses a sample video
    python test_transcript.py <URL_or_ID>     # test with any video you want

Goal: confirm the library can access and return a transcript BEFORE building the app.
"""

import re
import sys


def extract_video_id(url_or_id: str) -> str:
    """Accepts a full URL (several formats) or the raw ID and returns the ID."""
    # Already looks like an ID (11 characters, no slashes)
    if re.fullmatch(r"[0-9A-Za-z_-]{11}", url_or_id):
        return url_or_id

    patterns = [
        r"(?:v=|/v/|youtu\.be/|/embed/|/shorts/)([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)

    raise ValueError(f"Could not extract the video ID from: {url_or_id!r}")


def fetch_transcript(video_id: str, languages=("pt", "pt-BR", "en")):
    """
    Fetches the transcript. Compatible with both the new API (>=1.0) and the old
    API (<1.0) of the youtube-transcript-api library.
    """
    from youtube_transcript_api import YouTubeTranscriptApi

    # New API (>= 1.0): instance + .fetch()
    if hasattr(YouTubeTranscriptApi, "fetch") or callable(getattr(YouTubeTranscriptApi(), "fetch", None)):
        try:
            api = YouTubeTranscriptApi()
            fetched = api.fetch(video_id, languages=list(languages))
            # fetched is an iterable of snippets with .text / .start / .duration
            return [
                {"text": s.text, "start": s.start, "duration": s.duration}
                for s in fetched
            ]
        except AttributeError:
            pass  # fall back to the old mode below

    # Old API (< 1.0): static method get_transcript()
    return YouTubeTranscriptApi.get_transcript(video_id, languages=list(languages))


def main() -> int:
    # Sample video (feel free to change). This is a public TED-Ed talk with captions.
    input_value = sys.argv[1] if len(
        sys.argv) > 1 else "https://www.youtube.com/watch?v=arj7oStGLkU"

    try:
        video_id = extract_video_id(input_value)
    except ValueError as e:
        print(f"[ERROR] {e}")
        return 1

    print(f"Video ID: {video_id}")
    print("Fetching transcript (pt, pt-BR, en)...\n")

    try:
        segments = fetch_transcript(video_id)
    except Exception as e:
        print(
            f"[FAILED] Could not fetch the transcript: {type(e).__name__}: {e}")
        return 2

    full_text = " ".join(segment["text"] for segment in segments)

    print(f"[OK] Segments received: {len(segments)}")
    print(f"[OK] Text length: {len(full_text)} characters\n")
    print("--- Transcription ---")
    print(full_text)
    print("---------------------------------")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
