import type { ByteToken, Step } from "../bpe";
import { chipStyle } from "../colors";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
  topN: number;
}

// 当前词表 = 基础 token（原始切分）+ 已学到的合并 token。
// 排序：合并 token 按"合并时间"逆序在前（id 越大 = 合并越晚），基础 token（时间 0）在后。
// 所以 step 0 没有任何合并时，列表就是原始切分本身（英文=字符、中文=UTF-8 字节），不会是空。
// 每行附该 token 在当前序列中的出现频次（可能为 0：已被吸收进更大的 token，但仍留在词表里）。
export default function VocabularyTable({ step, tokens, topN }: Props) {
  // 当前序列中每个 token 的出现频次
  const freq = new Map<number, number>();
  for (const id of step.tokenIds) freq.set(id, (freq.get(id) ?? 0) + 1);

  // 合并 token：id ∈ [256, 256 + step.index)，按 id 降序（合并时间逆序）
  const merged: number[] = [];
  for (let id = 256 + step.index - 1; id >= 256; id--) merged.push(id);

  // 基础 token（原始切分）：词表里 id < 256 的，按字节值升序
  const base = [...tokens.keys()].filter((id) => id < 256).sort((a, b) => a - b);

  const rows = [...merged, ...base].slice(0, topN);
  const totalVocab = merged.length + base.length;

  return (
    <div className="space-y-1.5">
      {rows.map((id) => {
        const tok = tokens.get(id)!;
        const s = chipStyle(tok);
        const count = freq.get(id) ?? 0;
        const gone = count === 0;
        const isBase = id < 256;
        return (
          <div key={id} className="flex items-center gap-2">
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
            {isBase && (
              <span className="rounded bg-slate-700/50 px-1 text-[10px] text-slate-400">
                基础
              </span>
            )}
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
      {totalVocab > topN && (
        <div className="pt-1 text-[11px] text-slate-500">
          仅显示前 {topN} / 共 {totalVocab} 个（基础 {base.length} + 合并 {merged.length}）
        </div>
      )}
    </div>
  );
}
