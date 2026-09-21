"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadNotes, saveNotes } from "@/lib/storage";

/*
 * 내가 쓴 암기법. 세션 → 카드 → 연상법 블록 → 편집기까지 네 단계를 그냥
 * 통과만 하던 prop 이라 컨텍스트로 끊었다. 값이 바뀔 때 중간 컴포넌트들의
 * prop 목록을 건드리지 않아도 된다.
 */

type NotesValue = {
  /** key 는 `kanji:<글자>` */
  get: (key: string) => string;
  set: (key: string, value: string) => void;
};

const NotesContext = createContext<NotesValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    // localStorage 는 마운트 뒤에만 읽을 수 있다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(loadNotes());
  }, []);

  const set = useCallback((key: string, value: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      // 비우면 키를 지운다 — 빈 문자열이 쌓이면 저장소만 지저분해진다
      if (value.trim()) next[key] = value;
      else delete next[key];
      saveNotes(next);
      return next;
    });
  }, []);

  const get = useCallback((key: string) => notes[key] ?? "", [notes]);

  return (
    <NotesContext.Provider value={{ get, set }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNote(key: string) {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNote 는 NotesProvider 안에서만 쓸 수 있다");
  return { note: ctx.get(key), setNote: (v: string) => ctx.set(key, v) };
}
