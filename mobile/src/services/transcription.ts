import { API_BASE_URL } from '@/src/constants/config';

/**
 * Shape of the successful response returned by the backend /transcript route.
 */
export type TranscriptResult = {
  videoId: string;
  text: string;
};

/**
 * fetchTranscript
 * Sends a YouTube URL (or video ID) to the Python backend and returns the
 * plain-text transcript. Throws an Error with a readable message on failure so
 * the calling screen can show it to the user.
 */
export async function fetchTranscript(url: string): Promise<TranscriptResult> {
  const response = await fetch(`${API_BASE_URL}/transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  // FastAPI returns errors as { detail: "..." }. Try to surface that message.
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {
      // Response had no JSON body; keep the generic message above.
    }
    throw new Error(message);
  }

  const data = await response.json();
  return { videoId: data.video_id, text: data.text };
}
