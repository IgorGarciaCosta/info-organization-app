import { API_BASE_URL } from '@/src/constants/config';

/**
 * summarizeTranscript
 * Sends a transcript to the Python backend's /summarize route, which forwards it
 * to the AI model (Gemini) together with an instruction prompt and returns a
 * short summary. Throws an Error with a readable message on failure so the
 * calling screen can show it to the user.
 */
export async function summarizeTranscript(text: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
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
  return data.summary as string;
}
