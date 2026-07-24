import * as SQLite from "expo-sqlite";

import type { ContentAnalysis } from "@/src/services/ai";

export type SavedAnalysisSummary = {
  id: number;
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
            created_at TEXT NOT NULL
          );
        `);
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
  const result = await database.runAsync(
    `INSERT INTO saved_analyses
      (video_url, transcript, analysis_json, title, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    videoUrl,
    transcript,
    JSON.stringify(analysis),
    analysis.title,
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
    `SELECT id, video_url, transcript, analysis_json, title
     FROM saved_analyses
     WHERE id = ?`,
    id,
  );

  if (row === null) return null;

  return {
    id: row.id,
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
    `SELECT id, title
     FROM saved_analyses
     ORDER BY created_at DESC, id DESC`,
  );
}
