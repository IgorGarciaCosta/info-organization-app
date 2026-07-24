import * as SQLite from "expo-sqlite";

import type { ContentAnalysis } from "@/src/services/ai";

const POST_IT_COLORS = [
  "#FFF59D",
  "#FFCCBC",
  "#C8E6C9",
  "#BBDEFB",
  "#E1BEE7",
] as const;

export type SavedAnalysisSummary = {
  color: string;
  id: number;
  rotation: number;
  title: string;
};

export type SavedAnalysis = SavedAnalysisSummary & {
  videoUrl: string;
  transcript: string;
  analysis: ContentAnalysis;
};

type SavedAnalysisRow = {
  id: number;
  video_url: string;
  transcript: string;
  analysis_json: string;
  color: string;
  rotation: number;
  title: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * getDatabase
 * Opens the local database once and ensures its first schema is ready.
 */
async function getDatabase() {
  if (databasePromise === null) {
    databasePromise = SQLite.openDatabaseAsync("video-info.db").then(
      async (database) => {
        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS saved_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_url TEXT NOT NULL,
            transcript TEXT NOT NULL,
            analysis_json TEXT NOT NULL,
            title TEXT NOT NULL,
            color TEXT NOT NULL DEFAULT '#FFF59D',
            rotation INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
          );
        `);

        const columns = await database.getAllAsync<{ name: string }>(
          "PRAGMA table_info(saved_analyses)",
        );
        const columnNames = new Set(columns.map((column) => column.name));
        if (!columnNames.has("color")) {
          await database.execAsync(
            `ALTER TABLE saved_analyses ADD COLUMN color TEXT NOT NULL DEFAULT '#FFF59D';
             UPDATE saved_analyses SET color = CASE abs(random() % 5)
               WHEN 0 THEN '#FFF59D'
               WHEN 1 THEN '#FFCCBC'
               WHEN 2 THEN '#C8E6C9'
               WHEN 3 THEN '#BBDEFB'
               ELSE '#E1BEE7'
             END;`,
          );
        }
        if (!columnNames.has("rotation")) {
          await database.execAsync(
            `ALTER TABLE saved_analyses ADD COLUMN rotation INTEGER NOT NULL DEFAULT 0;
             UPDATE saved_analyses
             SET rotation = (abs(random() % 10) + 1) *
               CASE WHEN random() % 2 = 0 THEN 1 ELSE -1 END;`,
          );
        }
        return database;
      },
    );
  }

  return databasePromise;
}

/**
 * saveAnalysis
 * Persists one Gemini analysis together with the source URL and transcript.
 */
export async function saveAnalysis({
  videoUrl,
  transcript,
  analysis,
}: {
  videoUrl: string;
  transcript: string;
  analysis: ContentAnalysis;
}) {
  const database = await getDatabase();
  const color =
    POST_IT_COLORS[Math.floor(Math.random() * POST_IT_COLORS.length)];
  const rotation = Math.floor(Math.random() * 21) - 10 || 1;
  const result = await database.runAsync(
    `INSERT INTO saved_analyses
      (video_url, transcript, analysis_json, title, color, rotation, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    videoUrl,
    transcript,
    JSON.stringify(analysis),
    analysis.title,
    color,
    rotation,
    new Date().toISOString(),
  );

  return result.lastInsertRowId;
}

/**
 * deleteSavedAnalysis
 * Removes one locally saved analysis by its SQLite identifier.
 */
export async function deleteSavedAnalysis(id: number) {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM saved_analyses WHERE id = ?", id);
}

/**
 * getSavedAnalysis
 * Restores the complete data needed to reopen an analysis screen.
 */
export async function getSavedAnalysis(
  id: number,
): Promise<SavedAnalysis | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<SavedAnalysisRow>(
    `SELECT id, video_url, transcript, analysis_json, title, color, rotation
     FROM saved_analyses
     WHERE id = ?`,
    id,
  );

  if (row === null) return null;

  return {
    color: row.color,
    id: row.id,
    rotation: row.rotation,
    videoUrl: row.video_url,
    transcript: row.transcript,
    analysis: JSON.parse(row.analysis_json) as ContentAnalysis,
    title: row.title,
  };
}

/**
 * listSavedAnalyses
 * Returns lightweight records for the home grid, newest first.
 */
export async function listSavedAnalyses(): Promise<SavedAnalysisSummary[]> {
  const database = await getDatabase();
  return database.getAllAsync<SavedAnalysisSummary>(
    `SELECT id, title, color, rotation
     FROM saved_analyses
     ORDER BY created_at DESC, id DESC`,
  );
}
