import type { ByteToken, Step } from "../bpe";
import { chipStyle, showToken } from "../colors";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
}

function Chip({ token }: { token: ByteToken }) {
  const s = chipStyle(token);
  return (
    <span
      className="inline-flex items-center px-2 py-1 text-sm"
      style={{
        background: s.bg,
        border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
        borderRadius: "var(--radius-sm)",
        color: s.color,
        fontFamily: s.mono ? "var(--font-mono)" : undefined,
      }}
    >
      {showToken(token.text)}
    </span>
  );
}

// 「本步合并产物」卡片：补全因果链 —— 频率表榜首（为什么选它）→ 合并 → 新 token（它现在有几个）。
// 同时给出 N（合并前相邻对频次）和 K（合并后新 token 实际出现次数）。
export default function MergeProduct({ step, tokens }: Props) {
  const m = step.merge;
  if (!m) {
    return (
      <div className="text-sm" style={{ color: "var(--ink-dim)" }}>
        初始状态，尚无合并。每个字符已按 UTF-8 拆成裸字节。
      </div>
    );
  }

  const a = tokens.get(m.a)!;
  const b = tokens.get(m.b)!;
  const x = tokens.get(m.newId)!;
  const overlapped = m.count !== m.resultCount;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip token={a} />
        <span style={{ color: "var(--ink-dim)" }}>+</span>
        <Chip token={b} />
        <span style={{ color: "var(--ink-dim)" }}>→</span>
        <span style={{ boxShadow: "0 0 0 1.5px var(--accent), var(--glow-accent)", borderRadius: "var(--radius-sm)" }}>
          <Chip token={x} />
        </span>
      </div>

      <div className="flex gap-2 text-xs">
        <span
          className="rounded px-2 py-1"
          style={{ background: "color-mix(in srgb, var(--warn) 15%, transparent)", color: "var(--warn)" }}
        >
          N（合并前频次）= <b className="tabular-nums">{m.count}</b>
        </span>
        <span
          className="rounded px-2 py-1"
          style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}
        >
          K（合并后出现）= <b className="tabular-nums">{m.resultCount}</b> 次
        </span>
      </div>

      {overlapped && (
        <p className="text-[11px] leading-snug" style={{ color: "var(--ink-dim)" }}>
          N &gt; K：该对周期性重叠出现，相邻计数（可重叠）略高于不重叠地实际合并出的个数。
        </p>
      )}
    </div>
  );
}
