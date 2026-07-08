import {
  fetchTranscript as fetchYoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from 'youtube-transcript';

/**
 * Shape of the successful transcript result consumed by the UI.
 * `videoId` is kept for compatibility, `text` is the full readable transcript.
 */
export type TranscriptResult = {
  videoId: string;
  text: string;
};

/**
 * extractVideoId
 * Best-effort extraction of the 11-char YouTube video id from a URL or raw id.
 * Used only to label the result; the transcript library accepts the full URL.
 */
function extractVideoId(urlOrId: string): string {
  // Already a bare 11-character id (letters, digits, - and _).
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;

  // Try the common URL shapes: youtu.be/<id> and ...?v=<id>.
  const match =
    urlOrId.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ?? null;
  return match ? match[1] : '';
}

/**
 * fetchTranscript
 * Fetches a YouTube transcript DIRECTLY from the device (no backend). Running on
 * the phone means the request uses the phone's residential/mobile IP, which
 * YouTube blocks far less than the datacenter IPs a cloud server would use.
 *
 * Throws an Error with a readable (Portuguese) message on failure so the calling
 * screen can show it to the user.
 *
 * NOTE: On the web build this can fail due to the browser's CORS policy. It is
 * meant to run on the native app (Android/iOS), where CORS does not apply.
 */
export async function fetchTranscript(url: string): Promise<TranscriptResult> {
  const trimmed = url.trim();

  try {
    // The library accepts a full URL or a bare video id and returns an array of
    // caption segments ({ text, offset, duration }).
    const segments = await fetchYoutubeTranscript(trimmed);

    // Join the individual caption snippets into one readable block of text.
    const text = segments.map((segment) => segment.text).join(' ');

    return { videoId: extractVideoId(trimmed), text };
  } catch (error) {
    // Translate the library's typed errors into friendly Portuguese messages.
    if (error instanceof YoutubeTranscriptTooManyRequestError) {
      throw new Error(
        'O YouTube limitou as requisições. Tente novamente em alguns minutos.',
      );
    }
    if (error instanceof YoutubeTranscriptDisabledError) {
      throw new Error('Este vídeo não tem legendas/transcrição disponível.');
    }
    if (error instanceof YoutubeTranscriptNotAvailableError) {
      throw new Error('Não foi possível encontrar a transcrição deste vídeo.');
    }
    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      throw new Error('Vídeo indisponível. Verifique o link.');
    }

    // Fallback: surface whatever message we have, or a generic one.
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Falha ao buscar a transcrição.',
    );
  }
}
