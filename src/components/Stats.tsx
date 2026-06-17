import type { Step } from "../bpe";

interface Props {
  step: Step;
  byteLength: number;
}

// ds-data-card / ds-stat 语汇：mono kicker（大写）→ 细体大数字（accent 单位）→ mono 小注。
function Stat({
  label,
  value,
  unit,
  hint,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="ds-card px-4 py-3"
      style={
        accent
          ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 6%, var(--bg-lifted))" }
          : undefined
      }
    >
      <div className="ds-eyebrow ds-eyebrow--dim">{label}</div>
      <div
        className="mt-1 tabular-nums"
        style={{ fontSize: "30px", fontWeight: 250, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1 }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: "16px", fontWeight: 350, color: "var(--accent)", marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <div className="mt-1 font-mono-zh text-[10px]" style={{ color: "var(--ink-dim)" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export default function Stats({ step, byteLength }: Props) {
  const tokenCount = step.tokenIds.length;
  const ratio = tokenCount > 0 ? byteLength / tokenCount : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="原始字节数" value={String(byteLength)} hint="UTF-8 编码后" />
      <Stat label="当前 token 数" value={String(tokenCount)} hint={`第 ${step.index} 步`} />
      <Stat label="压缩率" value={ratio.toFixed(2)} unit="×" hint="字节 ÷ token" accent />
      <Stat label="词表大小" value={String(step.vocabSize)} hint="基础字节 + 合并数" />
    </div>
  );
}
