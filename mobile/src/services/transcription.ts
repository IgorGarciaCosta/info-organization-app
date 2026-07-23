import {
  fetchTranscript as fetchYoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from 'youtube-transcript';

/**
 * fetchTranscript
 * Fetches a YouTube transcript DIRECTLY from the device (no backend). Running on
 * the phone means the request uses the phone's residential/mobile IP, which
 * YouTube blocks far less than the datacenter IPs a cloud server would use.
 *
 * Throws an Error with a readable English message on failure so the calling
 * screen can show it to the user.
 *
 * NOTE: On the web build this can fail due to the browser's CORS policy. It is
 * meant to run on the native app (Android/iOS), where CORS does not apply.
 */
export async function fetchTranscript(url: string): Promise<string> {
  const trimmed = url.trim();

  try {
    // The library accepts a full URL or a bare video id and returns an array of
    // caption segments ({ text, offset, duration }).
    const segments = await fetchYoutubeTranscript(trimmed);

    // Join the individual caption snippets into one readable block of text.
    return segments.map((segment) => segment.text).join(' ');
  } catch (error) {
    // Translate the library's typed errors into friendly English messages.
    if (error instanceof YoutubeTranscriptTooManyRequestError) {
      throw new Error(
        'YouTube rate-limited the requests. Try again in a few minutes.',
      );
    }
    if (error instanceof YoutubeTranscriptDisabledError) {
      throw new Error('This video has no captions or transcript available.');
    }
    if (error instanceof YoutubeTranscriptNotAvailableError) {
      throw new Error('Could not find a transcript for this video.');
    }
    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      throw new Error('Video unavailable. Check the link.');
    }

    // Fallback: surface whatever message we have, or a generic one.
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch the transcript.',
    );
  }
}
