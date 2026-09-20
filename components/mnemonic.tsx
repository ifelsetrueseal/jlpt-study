"use client";

import { useState } from "react";
import type { Kanji } from "@/lib/types";

/**
 * 이 앱의 차별점. 한자를 부수 조각으로 쪼개서 보여주고 그 조각들로 만든
 * 연상 스토리를 붙인다. 사용자가 자기 메모를 쓰면 그게 기본안을 대체한다.
 */
export function MnemonicBlock({
  kanji,
  note,
}: {
  kanji: Kanji;
  note?: string;
}) {
  const text = note?.trim() || kanji.mnemonic;
  return (
    <div className="rounded-control bg-mnemonic-weak border border-mnemonic/30 p-3">
      {/* 상형자는 쪼갤 조각이 없어서 분해 줄 자체를 생략한다 */}
      {kanji.parts.length > 0 && (
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm">
        {kanji.parts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-muted mr-1">+</span>}
            <span className="font-jp text-mnemonic text-lg leading-none">
              {p.char}
            </span>
            <span className="text-sub text-xs">{p.name}</span>
          </span>
        ))}
        <span className="text-muted mx-1">=</span>
        <span className="font-jp text-text text-lg leading-none">
          {kanji.char}
        </span>
      </div>
      )}
      <p className="text-text/90 text-sm leading-relaxed">
        {text.replace(" (억지)", "")}
        {note?.trim() ? (
          <span className="text-mnemonic ml-1.5 text-xs">내 메모</span>
        ) : (
          text.includes("(억지)") && (
            <span className="text-muted ml-1.5 text-xs">억지</span>
          )
        )}
      </p>
    </div>
  );
}

/** 접었다 펴는 메모 편집기. 기본은 접힌 상태 — 카드가 길어지지 않게. */
export function NoteEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-muted hover:text-sub py-2 text-xs underline underline-offset-4"
      >
        {value ? "내 암기법 수정" : "내 암기법 쓰기"}
      </button>
    );
  }

  return (
    <textarea
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.scrollIntoView({ block: "center" })}
      onBlur={() => setOpen(false)}
      rows={3}
      placeholder="이 한자를 어떻게 외울지 나만의 연상을 써보세요"
      className="rounded-control bg-elev border-border placeholder:text-muted w-full border p-3 text-sm outline-none"
    />
  );
}
