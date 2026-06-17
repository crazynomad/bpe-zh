import type { ByteToken, Step } from "../bpe";
import { chipStyle } from "../colors";

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
        border: `1px solid ${s.border}`,
        color: s.color,
        fontFamily: s.mono ? '"SF Mono", Menlo, Consolas, monospace' : undefined,
      }}
    >
      {tok.text === " " ? "␣" : tok.text}
    </span>
  );
}

// BPE 步骤条：横向、全宽，每步用中文讲清这一步发生了什么
// （合并式 + 出现次数 + 当前 token 数 + 词表大小），可点击跳转。
export default function StepsBar({ steps, tokens, current, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {steps.map((st) => {
        const active = st.index === current;
        const m = st.merge;
        return (
          <button
            key={st.index}
            onClick={() => onSelect(st.index)}
            className="flex w-48 shrink-0 flex-col gap-1 rounded-lg border px-2.5 py-2 text-left transition"
            style={{
              borderColor: active ? "#2dd4bf" : "rgba(71,85,105,0.5)",
              background: active ? "rgba(45,212,191,0.1)" : "rgba(15,23,42,0.3)",
            }}
          >
            <div
              className="text-xs font-semibold"
              style={{ color: active ? "#5eead4" : "#cbd5e1" }}
            >
              {st.index === 0 ? "初始状态" : `第 ${st.index} 步`}
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs leading-snug">
              {m ? (
                <>
                  <Tk tok={tokens.get(m.a)!} />
                  <span className="text-slate-500">+</span>
                  <Tk tok={tokens.get(m.b)!} />
                  <span className="text-slate-500">→</span>
                  <Tk tok={tokens.get(m.newId)!} />
                  <span className="text-slate-400">出现 {m.count} 次</span>
                </>
              ) : (
                <span className="text-slate-400">每个字符按 UTF-8 拆成裸字节</span>
              )}
            </div>

            <div className="text-[11px] tabular-nums text-slate-500">
              token 数 {st.tokenIds.length} ｜ 词表 {st.vocabSize}
            </div>
          </button>
        );
      })}
    </div>
  );
}
