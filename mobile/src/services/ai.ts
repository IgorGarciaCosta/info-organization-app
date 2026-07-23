import { API_BASE_URL } from '@/src/constants/config';

export const IMPORTANCE_LEVELS = ['high', 'medium', 'low'] as const;
const GENRES = [
  'educational',
  'news',
  'opinion',
  'tutorial',
  'interview',
  'entertainment',
  'documentary',
  'other',
] as const;

export type TopicImportance = (typeof IMPORTANCE_LEVELS)[number];
export type ContentGenre = (typeof GENRES)[number];

export type ContentTopic = {
  title: string;
  content: string;
  importance: TopicImportance;
};

export type ContentAnalysis = {
  title: string;
  subtitle: string;
  theme: string;
  genre: ContentGenre;
  topics: ContentTopic[];
};

/**
 * isContentAnalysis
 * Protects the UI from stale or malformed backend responses at the HTTP boundary.
 */
function isContentAnalysis(value: unknown): value is ContentAnalysis {
  if (!value || typeof value !== 'object') return false;

  const analysis = value as Record<string, unknown>;
  return (
    typeof analysis.title === 'string' &&
    typeof analysis.subtitle === 'string' &&
    typeof analysis.theme === 'string' &&
    GENRES.includes(analysis.genre as ContentGenre) &&
    Array.isArray(analysis.topics) &&
    analysis.topics.every((topic) => {
      if (!topic || typeof topic !== 'object') return false;
      const item = topic as Record<string, unknown>;
      return (
        typeof item.title === 'string' &&
        typeof item.content === 'string' &&
        IMPORTANCE_LEVELS.includes(item.importance as TopicImportance)
      );
    })
  );
}

/**
 * summarizeTranscript
 * Sends a transcript to the backend and returns Gemini's structured analysis.
 */
export async function summarizeTranscript(text: string): Promise<ContentAnalysis> {
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

  const data: unknown = await response.json();
  if (!isContentAnalysis(data)) {
    throw new Error(
      'The backend still uses the old format. Deploy the current version to Render.',
    );
  }

  return data;
}
