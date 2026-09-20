"use client";

import type { DeckId, HistoryEntry, ProgressMap } from "./types";

/*
 * localStorage 접근은 전부 여기로 모은다. 나중에 Supabase 로 갈아탈 때
 * 이 파일과 decks.ts 두 개만 바꾸면 되게 하려는 것.
 */

const KEYS = {
  progress: "jlpt:progress",
  notes: "jlpt:notes",
  history: "jlpt:history",
  settings: "jlpt:settings",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // 손상된 값이 하나 있다고 앱 전체가 죽으면 안 된다
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 용량 초과 등. 저장 실패해도 학습은 계속되게 둔다.
  }
}

export const loadProgress = (): ProgressMap => read(KEYS.progress, {});
export const saveProgress = (p: ProgressMap) => write(KEYS.progress, p);

export const loadNotes = (): Record<string, string> => read(KEYS.notes, {});
export const saveNotes = (n: Record<string, string>) => write(KEYS.notes, n);

export const loadHistory = (): HistoryEntry[] => read(KEYS.history, []);
export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, 60);
  write(KEYS.history, next);
  return next;
}

export type Settings = { sessionSize: number };
const DEFAULT_SETTINGS: Settings = { sessionSize: 20 };

export const loadSettings = (): Settings => ({
  ...DEFAULT_SETTINGS,
  ...read(KEYS.settings, {}),
});
export const saveSettings = (s: Settings) => write(KEYS.settings, s);

/** 오늘 포함 며칠 연속으로 학습했는지. 히스토리 날짜만 보면 된다. */
export function streak(history: HistoryEntry[], today: string): number {
  const days = new Set(history.map((h) => h.date));
  const cursor = new Date(`${today}T00:00:00`);
  let count = 0;
  // 오늘 아직 안 했으면 어제부터 이어진 연속일을 보여준다
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const key = cursor.toLocaleDateString("sv-SE"); // YYYY-MM-DD
    if (!days.has(key)) return count;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
}

export type { DeckId };
