import type { ByteToken, Step } from "../bpe";
import { chipStyle } from "../colors";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
  topN: number;
}

// 当前词表：展示已学到的合并 token，按"最后合并时间"逆序（最新合并的在最上）。
// token id 从 256 起递增、与合并顺序一一对应，所以 id 越大 = 合并越晚。
// 每行附该 token 在当前序列中的出现频次（可能为 0：已被吸收进更大的 token，但仍留在词表里）。
export default function VocabularyTable({ step, tokens, topN }: Props) {
  // 当前步已存在的合并 token：id ∈ [256, 256 + step.index)
  const mergedIds: number[] = [];
  for (let id = 256 + step.index - 1; id >= 256; id--) mergedIds.push(id);
  const rows = mergedIds.slice(0, topN);

  // 当前序列中每个 token 的出现频次
  const freq = new Map<number, number>();
  for (const id of step.tokenIds) freq.set(id, (freq.get(id) ?? 0) + 1);

  if (rows.length === 0) {
    return <div className="text-sm text-slate-500">还没有合并出任何新 token。</div>;
  }

  return (
    <div className="space-y-1.5">
      {rows.map((id, i) => {
        const tok = tokens.get(id)!;
        const s = chipStyle(tok);
        const count = freq.get(id) ?? 0;
        const gone = count === 0;
        return (
          <div key={id} className="flex items-center gap-2">
            <span className="w-5 text-right text-[10px] tabular-nums text-slate-600">
              {i + 1}
            </span>
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-sm"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.color,
                fontFamily: s.mono ? '"SF Mono", Menlo, Consolas, monospace' : undefined,
                opacity: gone ? 0.4 : 1,
              }}
              title={`token #${id} · ${tok.bytes.length} 字节`}
            >
              {tok.text === " " ? "␣" : tok.text}
            </span>
            <span className="ml-auto text-xs tabular-nums">
              {gone ? (
                <span className="text-slate-600">已被吸收 · 0</span>
              ) : (
                <span className="text-slate-300">{count} 次</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
