"use client";

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
