# info-organization-app

Fetch and organize transcripts from online videos to feed into LLMs (e.g. Gemini)
for summaries and insights.

This repository starts small: a standalone script that validates access to the
[`youtube-transcript-api`](https://pypi.org/project/youtube-transcript-api/)
library before building the full application.

## Why

The long-term goal is an app where you paste a video link and get back a clean
transcript plus an AI summary. YouTube is the easiest and most reliable starting
point because it exposes captions that can be read without downloading the video.

## Current status

- ✅ YouTube transcript fetching (free, no API key, no signup)
- ⏳ Other platforms (TikTok, etc.) planned for later stages

## Requirements

- Python 3.9+
- Dependencies listed in `requirements.txt`

## Setup

```bash
pip install -r requirements.txt
```

## Usage

```bash
# Run with the built-in sample video
python test_transcript.py

# Or pass any YouTube URL or video ID
python test_transcript.py "https://www.youtube.com/watch?v=YOUR_VIDEO"
python test_transcript.py YOUR_VIDEO_ID
```

The script accepts full URLs (watch, youtu.be, shorts, embed) or a raw 11-character
video ID. It prioritizes Portuguese captions (`pt`, `pt-BR`) and falls back to
English (`en`).

## Notes

- The library uses a rate-limit model (no hard monthly cap), but sending many
  requests from the same IP in a short time may trigger temporary blocks from
  YouTube.
- Only YouTube is supported at this stage.

## Roadmap

1. Validate transcript retrieval (this script) ✅
2. Send the transcript to an LLM (Gemini) for summaries
3. Wrap it in a serverless function
4. Build the mobile client (React Native)
