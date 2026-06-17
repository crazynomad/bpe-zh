import type { ByteToken, Step } from "../bpe";
import { chipStyle, showToken } from "../colors";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
  showIds: boolean;
}

// 渲染上限：超长文本（如整篇论文）只画前 CAP 个 token，避免上万 DOM 节点卡顿。
// 训练仍在全文上进行，统计/压缩率反映完整文本，这里只折叠"看得见的"部分。
const CAP = 1500;

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

  const shown = step.tokenIds.length > CAP ? step.tokenIds.slice(0, CAP) : step.tokenIds;
  const hidden = step.tokenIds.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((id, i) => {
        const tok = tokens.get(id)!;
        const s = chipStyle(tok);
        const isJustMerged = id === justMergedId;
        const isNext = nextPairIdx.has(i);
        return (
          <span
            key={i}
            className="inline-flex flex-col items-center px-2 py-1 text-sm leading-tight transition-all"
            style={{
              background: s.bg,
              border: `1px ${s.dashed ? "dashed" : "solid"} ${
                isNext ? "var(--warn)" : s.border
              }`,
              borderRadius: "var(--radius-sm)",
              color: s.color,
              fontFamily: s.mono ? "var(--font-mono)" : undefined,
              boxShadow: isJustMerged
                ? "0 0 0 1.5px var(--accent), var(--glow-accent)"
                : isNext
                ? "0 0 0 1px color-mix(in srgb, var(--warn) 55%, transparent)"
                : undefined,
            }}
            title={`token #${id} · ${tok.bytes.length} 字节 · 字节 [${tok.bytes
              .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
              .join(" ")}]`}
          >
            <span className="whitespace-pre">{showToken(tok.text)}</span>
            {showIds && (
              <span className="mt-0.5 text-[10px] opacity-60">{id}</span>
            )}
          </span>
        );
      })}
      {hidden > 0 && (
        <span
          className="inline-flex items-center px-2 py-1 text-xs"
          style={{ color: "var(--ink-dim)" }}
          title="超长文本只渲染前 1500 个 token；训练与统计仍基于完整文本"
        >
          …还有 {hidden} 个 token（已折叠）
        </span>
      )}
    </div>
  );
}
