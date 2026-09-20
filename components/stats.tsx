"use client";

import { cn } from "@/lib/utils";
import type { DeckProgress } from "@/lib/stats";

/**
 * 덱 진도. 익힘 ⊂ 학습 시작 ⊂ 전체 로 겹치는 단계라서, 색을 나누지 않고
 * 같은 파랑의 진하기로만 구분한다(순서가 있는 값이므로). 두 칸 사이에는
 * 2px 를 띄워 경계가 색만으로 구분되지 않게 한다.
 */
export function ProgressMeter({
  label,
  data,
}: {
  label: string;
  data: DeckProgress;
}) {
  const pct = (n: number) => `${(n / Math.max(data.total, 1)) * 100}%`;
  const studying = data.started - data.learned;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted tabular-nums">
          {data.started}
          <span className="text-border"> / </span>
          {data.total}
        </span>
      </div>
      <div className="bg-elev flex h-2 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: pct(data.learned) }}
        />
        {studying > 0 && (
          <div
            className="bg-accent/70 ml-0.5 h-full rounded-full"
            style={{ width: pct(studying) }}
          />
        )}
      </div>
    </div>
  );
}

export function MeterLegend() {
  return (
    <div className="text-muted flex gap-3 text-xs">
      <span className="flex items-center gap-1.5">
        <i className="bg-accent inline-block h-2 w-2 rounded-full" />
        익힘 (21일 이상)
      </span>
      <span className="flex items-center gap-1.5">
        <i className="bg-accent/70 inline-block h-2 w-2 rounded-full" />
        학습 중
      </span>
    </div>
  );
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

/** 최근 며칠간 하루에 몇 장 봤는지. 꾸준함이 보이는 게 목적이라 눈금은 안 그린다. */
export function WeekBars({
  data,
  today,
}: {
  data: { date: string; count: number }[];
  today: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const peak = data.findIndex((d) => d.count === max && d.count > 0);

  return (
    <div className="flex h-24 gap-0.5">
      {data.map((d, i) => {
        const isToday = d.date === today;
        return (
          <div
            key={d.date}
            className="flex h-full flex-1 flex-col items-center"
          >
            {/* 숫자는 가장 많이 한 날에만 — 모든 막대에 붙이면 읽히지 않는다 */}
            <span className="text-muted h-4 text-[10px] tabular-nums">
              {i === peak ? d.count : ""}
            </span>
            {/*
              막대는 부모 높이의 비율이라 부모에 확정 높이가 있어야 한다.
              flex-1 로 높이를 확정하고 그 안에서 바닥에 붙여 키운다.
            */}
            <div
              className="relative w-full flex-1"
              // 숫자를 막대마다 찍으면 읽히지 않으니, 값은 여기에 붙여둔다
              title={`${d.date} ${d.count}장`}
              aria-label={`${d.date} ${d.count}장`}
            >
              <div
                className={cn(
                  "absolute bottom-0 w-full rounded-t-[4px]",
                  d.count > 0 ? "bg-accent" : "bg-elev",
                )}
                style={{
                  height: d.count > 0 ? `${(d.count / max) * 100}%` : "2px",
                }}
              />
            </div>
            <span
              className={cn(
                "mt-1 text-[11px]",
                isToday ? "text-text font-medium" : "text-muted",
              )}
            >
              {WEEKDAY[new Date(`${d.date}T00:00:00`).getDay()]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatTile({
  value,
  unit,
  label,
}: {
  value: string | number;
  unit?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-semibold tabular-nums">
        {value}
        {unit && (
          <span className="text-muted ml-0.5 text-xs font-normal">{unit}</span>
        )}
      </span>
      <span className="text-muted text-xs">{label}</span>
    </div>
  );
}
