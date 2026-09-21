"use client";

import { SpeakerHigh } from "@phosphor-icons/react/dist/ssr";
import { Furigana, stripFurigana } from "@/lib/furigana";
import { plainReading, speak } from "@/lib/speech";
import { kanjiIn, lookupKanji } from "@/lib/decks";
import type { Card as CardData, Kanji, Word } from "@/lib/types";
import { MnemonicBlock, NoteEditor } from "@/components/mnemonic";
import { useNote } from "@/components/notes-context";
import { Readings } from "@/components/reading";

export type RevealField = "meaning" | "reading" | "mnemonic";
export type Reveal = Record<RevealField, boolean>;

/*
 * 한자 카드와 단어 카드는 같이 뜨지 않는다. 한 컴포넌트에서 분기로 처리하면
 * 읽는 사람이 두 흐름을 동시에 따라가야 해서, 덱을 고르는 분기 하나만 남기고
 * 나머지는 각자의 컴포넌트 안에서 자기 것만 다루게 했다.
 */
export function Flashcard({ card, reveal }: { card: CardData; reveal: Reveal }) {
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-44">
      {card.deck === "kanji" ? (
        <KanjiCard kanji={card} reveal={reveal} />
      ) : (
        <WordCard word={card} reveal={reveal} />
      )}
    </div>
  );
}

function KanjiCard({ kanji, reveal }: { kanji: Kanji; reveal: Reveal }) {
  // 한자 한 글자는 읽기가 여럿이라 TTS 가 못 고른다. 음독을 먼저 들려준다.
  const readAloud = plainReading(kanji.on[0] ?? kanji.kun[0] ?? kanji.char);
  const full = lookupKanji(kanji.char);

  return (
    <>
      <Face
        // 음·훈 두 줄이 들어갈 자리를 미리 비워 둔다
        readingSlot="min-h-16"
        reading={
          reveal.reading && (
            // 음독·훈독은 섞어 놓으면 어느 쪽인지 구분이 안 된다
            <dl className="text-sub flex flex-col items-center gap-0.5 text-lg">
              <ReadingRow label="음" items={kanji.on} />
              <ReadingRow label="훈" items={kanji.kun} />
            </dl>
          )
        }
        glyph={kanji.char}
        onSpeak={() => speak(readAloud)}
        meaning={reveal.meaning && kanji.korMeaning}
      />

      {reveal.mnemonic &&
        (full ? (
          <Mnemonic kanji={full}>
            {/* 글자·뜻·음훈은 이미 위에 크게 있으니 부수만 덧붙인다 */}
            <Radical kanji={full} />
          </Mnemonic>
        ) : (
          <NoMnemonic />
        ))}
    </>
  );
}

function WordCard({ word, reveal }: { word: Word; reveal: Reveal }) {
  // 예문은 앞면엔 안 띄운다. 뜻이든 읽기든 한 번 열고 나서 보는 참고 자료.
  const showExample = reveal.meaning || reveal.reading;
  const kanjiList = kanjiIn(word.word);

  return (
    <>
      <Face
        readingSlot="min-h-8"
        reading={
          reveal.reading && (
            <p className="font-jp text-sub text-lg">{word.reading}</p>
          )
        }
        glyph={word.word}
        onSpeak={() => speak(word.reading)}
        meaning={reveal.meaning && word.meaning}
      />

      {showExample && word.example && (
        <>
          <div className="border-border border-t" />
          <div className="text-center">
            <button
              onClick={() => speak(stripFurigana(word.example!.jp))}
              aria-label="예문 듣기"
              className="font-jp text-base leading-loose"
            >
              <Furigana text={word.example.jp} show={reveal.reading} />
              <SpeakerHigh
                size={16}
                className="text-muted ml-1.5 inline shrink-0 align-middle"
              />
            </button>
            {reveal.meaning && (
              <p className="text-muted mt-2 text-sm">{word.example.ko}</p>
            )}
          </div>
        </>
      )}

      {reveal.mnemonic &&
        (kanjiList.length > 0 ? (
          <div className="flex flex-col gap-3">
            {kanjiList.map((k) => (
              <Mnemonic key={k.char} kanji={k}>
                {/* 단어 카드에선 그 한자가 처음 나오므로 뜻·읽기부터 보여준다 */}
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
                <Radical kanji={k} />
              </Mnemonic>
            ))}
          </div>
        ) : (
          <NoMnemonic />
        ))}
    </>
  );
}

/**
 * 카드 앞면. 공개 버튼을 눌러도 글자가 움직이지 않도록 위치를 고정하고,
 * 읽기·뜻 줄은 비어 있어도 높이를 차지하게 둔다.
 */
function Face({
  readingSlot,
  reading,
  glyph,
  onSpeak,
  meaning,
}: {
  readingSlot: string;
  reading: React.ReactNode;
  glyph: string;
  onSpeak: () => void;
  meaning: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 pt-10 text-center">
      <div className={`flex flex-col justify-end ${readingSlot}`}>{reading}</div>
      {/*
        스피커는 absolute 로 띄운다. 흐름에 끼면 그만큼 글자가 왼쪽으로
        밀려서 화면 정중앙을 벗어난다.
      */}
      <button
        onClick={onSpeak}
        aria-label="일본어로 듣기"
        className="relative flex items-center"
      >
        <span className="font-jp text-6xl leading-tight">{glyph}</span>
        <SpeakerHigh
          size={20}
          className="text-muted absolute top-1/2 -right-7 -translate-y-1/2"
        />
      </button>
      <p className="min-h-8 text-xl font-medium">{meaning}</p>
    </div>
  );
}

function ReadingRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-muted text-xs">{label}</dt>
      <dd>
        <Readings items={items} />
      </dd>
    </div>
  );
}

function Radical({ kanji }: { kanji: Kanji }) {
  return (
    <span className="text-muted">
      부수 {kanji.radical.char} ({kanji.radical.name})
    </span>
  );
}

/** 연상법 한 덩어리. 위에 붙는 설명 줄은 덱마다 달라서 children 으로 받는다. */
function Mnemonic({
  kanji,
  children,
}: {
  kanji: Kanji;
  children: React.ReactNode;
}) {
  const { note, setNote } = useNote(`kanji:${kanji.char}`);
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sub flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs">
        {children}
      </div>
      <MnemonicBlock kanji={kanji} note={note} />
      <NoteEditor value={note} onChange={setNote} />
    </div>
  );
}

function NoMnemonic() {
  return (
    <p className="text-muted text-center text-sm">
      등록된 연상 암기법이 없습니다.
    </p>
  );
}
