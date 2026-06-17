import type { ByteToken, Step } from "../bpe";
import { chipStyle } from "../colors";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
  showIds: boolean;
}

// 渲染当前 token 序列。两类高亮：
//  1) 刚刚被合并出来的新 token（step.merge.newId）→ 绿色脉冲环
//  2) 下一步将被合并的相邻对（step.topPairs[0]）→ 黄色描边，和频率表呼应
export default function TokenRow({ step, tokens, showIds }: Props) {
  const justMergedId = step.merge?.newId ?? null;
  const next = step.topPairs[0];

  // 标出下一步将合并的相邻对的位置（不重叠，从左到右）
  const nextPairIdx = new Set<number>();
  if (next) {
    const seq = step.tokenIds;
    for (let i = 0; i < seq.length - 1; i++) {
      if (seq[i] === next.a && seq[i + 1] === next.b) {
        nextPairIdx.add(i);
        nextPairIdx.add(i + 1);
        i++; // 不重叠
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {step.tokenIds.map((id, i) => {
        const tok = tokens.get(id)!;
        const s = chipStyle(tok);
        const isJustMerged = id === justMergedId;
        const isNext = nextPairIdx.has(i);
        return (
          <span
            key={i}
            className="inline-flex flex-col items-center rounded-md px-2 py-1 text-sm leading-tight transition-all"
            style={{
              background: s.bg,
              border: `1px solid ${isNext ? "#fbbf24" : s.border}`,
              color: s.color,
              fontFamily: s.mono
                ? '"SF Mono", Menlo, Consolas, monospace'
                : undefined,
              boxShadow: isJustMerged
                ? "0 0 0 2px rgba(34,197,94,0.6), 0 0 12px rgba(34,197,94,0.35)"
                : isNext
                ? "0 0 0 1px rgba(251,191,36,0.5)"
                : undefined,
            }}
            title={`token #${id} · ${tok.bytes.length} 字节 · 字节 [${tok.bytes
              .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
              .join(" ")}]`}
          >
            <span className="whitespace-pre">
              {tok.text === " " ? "␣" : tok.text}
            </span>
            {showIds && (
              <span className="mt-0.5 text-[10px] opacity-60">{id}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
