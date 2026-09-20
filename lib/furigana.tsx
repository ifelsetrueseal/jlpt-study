import { Fragment } from "react";

/** "道[みち]に迷[まよ]った" 의 한자+대괄호 쌍 */
const RUBY = /([一-龯々]+)\[([^\]]+)\]/g;

/**
 * 대괄호 후리가나 표기를 <ruby> 로 렌더한다.
 * show=false 면 읽기를 떼고 한자만 보여준다(카드 앞면용).
 */
export function Furigana({ text, show }: { text: string; show: boolean }) {
  if (!show) return <>{text.replace(RUBY, "$1")}</>;

  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(RUBY)) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <ruby key={m.index}>
        {m[1]}
        <rt>{m[2]}</rt>
      </ruby>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return (
    <>
      {nodes.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}

/** 대괄호를 걷어낸 순수 일본어 문장 */
export const stripFurigana = (text: string) => text.replace(RUBY, "$1");
