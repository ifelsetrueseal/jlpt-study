"use client";

import { Furigana } from "@/lib/furigana";
import { kanjiIn, lookupKanji } from "@/lib/decks";
import type { Card as CardData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MnemonicBlock, NoteEditor } from "@/components/mnemonic";
import { Readings } from "@/components/reading";

type Props = {
  card: CardData;
  /** 뜻 공개 여부 */
  showMeaning: boolean;
  /** 읽기(히라가나) 공개 여부 */
  showReading: boolean;
  onReveal: (field: "meaning" | "reading") => void;
  notes: Record<string, string>;
  onNote: (key: string, value: string) => void;
};

export function Flashcard({
  card,
  showMeaning,
  showReading,
  onReveal,
  notes,
  onNote,
}: Props) {
  // 뒷면(상세 + 연상법)은 둘 다 공개한 뒤에 연다. 연상법 문구에 읽기가
  // 들어 있어서 하나만 열면 나머지 답이 새기 때문.
  const revealed = showMeaning && showReading;
  // 연상법은 한자 덱이면 그 한자, 단어 덱이면 단어에 든 한자 전부
  const kanjiList =
    card.deck === "kanji"
      ? [lookupKanji(card.char)].filter((k) => k !== undefined)
      : kanjiIn(card.word);

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-5">
      {/* 앞면 */}
      <div className="flex flex-col items-center gap-2 pt-8 text-center">
        {showReading &&
          (card.deck === "kanji" ? (
            // 음독·훈독은 섞어 놓으면 어느 쪽인지 구분이 안 된다
            <dl className="text-sub flex flex-col items-center gap-0.5 text-lg">
              {card.on.length > 0 && (
                <div className="flex items-baseline gap-2">
                  <dt className="text-muted text-xs">음</dt>
                  <dd>
                    <Readings items={card.on} />
                  </dd>
                </div>
              )}
              {card.kun.length > 0 && (
                <div className="flex items-baseline gap-2">
                  <dt className="text-muted text-xs">훈</dt>
                  <dd>
                    <Readings items={card.kun} />
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="font-jp text-sub text-lg">{card.reading}</p>
          ))}
        <p className="font-jp text-6xl leading-tight">
          {card.deck === "kanji" ? card.char : card.word}
        </p>
        {showMeaning && (
          <p className="text-xl font-medium">
            {card.deck === "kanji" ? card.korMeaning : card.meaning}
          </p>
        )}
      </div>

      {card.deck === "word" && card.example && (
        <>
          <div className="border-border border-t" />
          <div className="font-jp text-center text-base leading-loose">
            <Furigana text={card.example.jp} show={showReading} />
            {showMeaning && (
              <p className="text-muted mt-2 font-sans text-sm">
                {card.example.ko}
              </p>
            )}
          </div>
        </>
      )}

      {/* 뒷면 — 공개된 뒤에만 */}
      {revealed && (
        <div className="flex flex-col gap-3">
          {kanjiList.map((k) => {
            const key = `kanji:${k.char}`;
            return (
              <div key={k.char} className="flex flex-col gap-2">
                {/* 한자 덱은 위에 이미 글자·뜻·음훈이 크게 있으니 부수만 덧붙인다 */}
                <div className="text-sub flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs">
                  {card.deck === "word" && (
                    <>
                      <span className="font-jp text-text text-2xl leading-none">
                        {k.char}
                      </span>
                      <span className="text-text text-sm font-medium">
                        {k.korMeaning}
                      </span>
                      {k.on.length > 0 && (
                        <span>
                          음 <Readings items={k.on} />
                        </span>
                      )}
                      {k.kun.length > 0 && (
                        <span>
                          훈 <Readings items={k.kun} />
                        </span>
                      )}
                    </>
                  )}
                  <span className="text-muted">
                    부수 {k.radical.char} ({k.radical.name})
                  </span>
                </div>
                <MnemonicBlock kanji={k} note={notes[key]} />
                <NoteEditor
                  value={notes[key] ?? ""}
                  onChange={(v) => onNote(key, v)}
                />
              </div>
            );
          })}
          {kanjiList.length === 0 && (
            <p className="text-muted text-center text-sm">
              등록된 연상 암기법이 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 공개 버튼 */}
      <div className="mt-auto flex gap-2 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          disabled={showMeaning}
          onClick={() => onReveal("meaning")}
        >
          {card.deck === "kanji" ? "뜻" : "의미"}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={showReading}
          onClick={() => onReveal("reading")}
        >
          {card.deck === "kanji" ? "음·훈" : "히라가나"}
        </Button>
      </div>
    </div>
  );
}
