import { useEffect, useRef } from "react";
import type { ByteToken, Step } from "../bpe";
import { chipStyle, showToken } from "../colors";

interface Props {
  steps: Step[];
  tokens: Map<number, ByteToken>;
  current: number;
  onSelect: (i: number) => void;
}

// 行内 token 小标签（带配色），用于合并式展示。
function Tk({ tok }: { tok: ByteToken }) {
  const s = chipStyle(tok);
  return (
    <span
      className="rounded px-1 py-0.5"
      style={{
        background: s.bg,
        border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
        color: s.color,
        fontFamily: s.mono ? "var(--font-mono)" : undefined,
      }}
    >
      {showToken(tok.text)}
    </span>
  );
}

// BPE 步骤条：横向、全宽，每步用中文讲清这一步发生了什么
// （合并式 + 出现次数 + 当前 token 数 + 词表大小），可点击跳转。
export default function StepsBar({ steps, tokens, current, onSelect }: Props) {
  // 当前步始终是最右侧那张卡，随推进自动滚动到末尾，保证当前步可见。
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [current]);

  return (
    <div ref={ref} className="flex gap-2 overflow-x-auto pb-2">
      {steps.map((st) => {
        const active = st.index === current;
        const m = st.merge;
        return (
          <button
            key={st.index}
            onClick={() => onSelect(st.index)}
            className="flex w-48 shrink-0 flex-col gap-1 px-2.5 py-2 text-left transition"
            style={{
              border: `1px solid ${active ? "var(--accent)" : "var(--ink-faint)"}`,
              borderRadius: "var(--radius-sm)",
              background: active
                ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                : "color-mix(in srgb, var(--ink) 3%, transparent)",
              boxShadow: active ? "var(--glow-accent)" : undefined,
            }}
          >
            <div
              className="font-mono-zh text-[11px] font-semibold uppercase"
              style={{ letterSpacing: "0.08em", color: active ? "var(--accent)" : "var(--ink-muted)" }}
            >
              {st.index === 0 ? "初始" : `STEP ${st.index}`}
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs leading-snug">
              {m ? (
                <>
                  <Tk tok={tokens.get(m.a)!} />
                  <span style={{ color: "var(--ink-dim)" }}>+</span>
                  <Tk tok={tokens.get(m.b)!} />
                  <span style={{ color: "var(--ink-dim)" }}>→</span>
                  <Tk tok={tokens.get(m.newId)!} />
                  <span style={{ color: "var(--ink-dim)" }}>出现 {m.count} 次</span>
                </>
              ) : (
                <span style={{ color: "var(--ink-dim)" }}>每个字符按 UTF-8 拆成裸字节</span>
              )}
            </div>

            <div className="font-mono-zh text-[11px] tabular-nums" style={{ color: "var(--ink-dim)" }}>
              token {st.tokenIds.length} ｜ 词表 {st.vocabSize}
            </div>
          </button>
        );
      })}
    </div>
  );
}
