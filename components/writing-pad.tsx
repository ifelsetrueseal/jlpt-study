"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  Eye,
  EyeSlash,
  GridFour,
  Trash,
  X,
} from "@phosphor-icons/react/dist/ssr";

type Point = { x: number; y: number };

/**
 * 획을 따라 써보는 연습 패드. 글자를 흐리게 깔고 그 위에 손으로 쓴다.
 * 획은 저장하지 않는다 — 카드를 넘기면 사라지는 연습용.
 * 본보기(guide)는 한자만 받는다. 단어는 히라가나를 뺀 한자만 넘겨서
 * 明るい → 明 처럼 칸이 빽빽해지지 않게 한다.
 */
export function WritingPad({
  guide,
  onClose,
}: {
  guide: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef(false);
  const [grid, setGrid] = useState(true);
  // 본보기는 기본으로 꺼둔다. 외워서 쓰다 막히면 눈 아이콘으로 잠깐 확인.
  const [showGuide, setShowGuide] = useState(false);
  const [count, setCount] = useState(0); // 버튼 비활성 판단용

  function ctx() {
    const c = canvasRef.current;
    return c?.getContext("2d") ?? null;
  }

  /** 캔버스를 화면 크기에 맞춘다. 기기 배율을 반영해야 선이 안 뭉갠다. */
  function resize() {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const g = ctx();
    if (!g) return;
    g.scale(dpr, dpr);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineWidth = 8;
    g.strokeStyle = "#e8d5d5";
    redraw();
  }

  function redraw() {
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
    const dpr = window.devicePixelRatio || 1;
    g.clearRect(0, 0, c.width / dpr, c.height / dpr);
    for (const s of strokes.current) {
      g.beginPath();
      s.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      g.stroke();
    }
  }

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function at(e: React.PointerEvent): Point {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    strokes.current.push([at(e)]);
    setCount(strokes.current.length);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const g = ctx();
    const stroke = strokes.current[strokes.current.length - 1];
    const p = at(e);
    const prev = stroke[stroke.length - 1];
    stroke.push(p);
    if (!g) return;
    // 매번 전체를 다시 그리면 느리니 새로 이어진 구간만 긋는다
    g.beginPath();
    g.moveTo(prev.x, prev.y);
    g.lineTo(p.x, p.y);
    g.stroke();
  }

  function end() {
    drawing.current = false;
  }

  function undo() {
    strokes.current.pop();
    setCount(strokes.current.length);
    redraw();
  }

  function clear() {
    strokes.current = [];
    setCount(0);
    redraw();
  }

  return (
    <div className="bg-bg fixed inset-0 z-30 flex">
      <div className="relative mx-auto w-full max-w-lg">
        {/*
          연습칸. viewBox 100x100 정사각형이라 화면 비율이 달라져도
          글자와 안내선이 같이 스케일된다 — vmin 으로 잡으면 기기마다 틀어진다.
        */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {grid && (
            <g className="text-border" stroke="currentColor" strokeWidth="0.3">
              <rect x="2" y="2" width="96" height="96" fill="none" />
              <g strokeDasharray="2 3">
                <line x1="50" y1="2" x2="50" y2="98" />
                <line x1="2" y1="50" x2="98" y2="50" />
                <line x1="2" y1="2" x2="98" y2="98" />
                <line x1="98" y1="2" x2="2" y2="98" />
              </g>
            </g>
          )}
          {showGuide && (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={84 / guide.length}
              fill="white"
              fillOpacity="0.08"
              className="font-jp"
            >
              {guide}
            </text>
          )}
        </svg>
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="absolute inset-0 h-full w-full touch-none"
        />

        {/* 연습칸은 화면 폭을 꽉 채우므로 도구는 칸 아래 여백에 가로로 둔다 */}
        <div className="pb-safe absolute inset-x-0 bottom-0 flex justify-center">
          <div className="bg-elev flex overflow-hidden rounded-full">
            <PadButton
              onClick={undo}
              disabled={count === 0}
              label="한 획 되돌리기"
            >
              <ArrowCounterClockwise size={20} />
            </PadButton>
            <PadButton
              onClick={clear}
              disabled={count === 0}
              label="전부 지우기"
            >
              <Trash size={20} />
            </PadButton>
            <PadButton
              onClick={() => setShowGuide((v) => !v)}
              label={showGuide ? "본보기 글자 가리기" : "본보기 글자 보기"}
              active={showGuide}
            >
              {showGuide ? <Eye size={20} /> : <EyeSlash size={20} />}
            </PadButton>
            <PadButton
              onClick={() => setGrid((v) => !v)}
              label={grid ? "안내선 끄기" : "안내선 켜기"}
              active={grid}
            >
              <GridFour size={20} />
            </PadButton>
            <PadButton onClick={onClose} label="쓰기 끝내기">
              <X size={20} />
            </PadButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PadButton({
  children,
  label,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex h-12 w-12 items-center justify-center disabled:opacity-30 ${
        active ? "text-accent" : "text-sub"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
