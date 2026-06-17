import type { ByteToken, Step } from "../bpe";
import { chipStyle } from "../colors";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
}

function Chip({ token }: { token: ByteToken }) {
  const s = chipStyle(token);
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-1 text-sm"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontFamily: s.mono ? '"SF Mono", Menlo, Consolas, monospace' : undefined,
      }}
    >
      {token.text === " " ? "␣" : token.text}
    </span>
  );
}

// 「本步合并产物」卡片：补全因果链 —— 频率表榜首（为什么选它）→ 合并 → 新 token（它现在有几个）。
// 同时给出 N（合并前相邻对频次）和 K（合并后新 token 实际出现次数）。
export default function MergeProduct({ step, tokens }: Props) {
  const m = step.merge;
  if (!m) {
    return (
      <div className="text-sm text-slate-500">
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
        <span className="text-slate-500">+</span>
        <Chip token={b} />
        <span className="text-slate-500">→</span>
        <span
          style={{ boxShadow: "0 0 0 2px rgba(34,197,94,0.6)" }}
          className="rounded-md"
        >
          <Chip token={x} />
        </span>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="rounded bg-amber-400/15 px-2 py-1 text-amber-200">
          N（合并前频次）= <b className="tabular-nums">{m.count}</b>
        </span>
        <span className="rounded bg-green-400/15 px-2 py-1 text-green-200">
          K（合并后出现）= <b className="tabular-nums">{m.resultCount}</b> 次
        </span>
      </div>

      {overlapped && (
        <p className="text-[11px] leading-snug text-slate-500">
          N &gt; K：该对周期性重叠出现，相邻计数（可重叠）略高于不重叠地实际合并出的个数。
        </p>
      )}
    </div>
  );
}
