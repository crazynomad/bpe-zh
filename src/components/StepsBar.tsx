import type { ByteToken, Step } from "../bpe";
import { chipStyle } from "../colors";

interface Props {
  steps: Step[];
  tokens: Map<number, ByteToken>;
  current: number;
  onSelect: (i: number) => void;
}

// BPE 步骤条：横向、全宽，展示从初始到末步的每一步合并产物，可点击跳转。
export default function StepsBar({ steps, tokens, current, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {steps.map((s) => {
        const active = s.index === current;
        const tok = s.merge ? tokens.get(s.merge.newId)! : null;
        const style = tok ? chipStyle(tok) : null;
        return (
          <button
            key={s.index}
            onClick={() => onSelect(s.index)}
            className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 transition"
            style={{
              borderColor: active ? "#2dd4bf" : "rgba(71,85,105,0.5)",
              background: active ? "rgba(45,212,191,0.1)" : "transparent",
            }}
            title={
              s.merge
                ? `第 ${s.index} 步：合并出 ${tok!.text}`
                : "初始：UTF-8 裸字节"
            }
          >
            <span
              className="text-[10px] tabular-nums"
              style={{ color: active ? "#5eead4" : "#64748b" }}
            >
              {s.index === 0 ? "初始" : `步 ${s.index}`}
            </span>
            {tok && style ? (
              <span
                className="max-w-full truncate rounded px-1.5 py-0.5 text-xs"
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  color: style.color,
                  fontFamily: style.mono
                    ? '"SF Mono", Menlo, Consolas, monospace'
                    : undefined,
                }}
              >
                {tok.text === " " ? "␣" : tok.text}
              </span>
            ) : (
              <span className="text-xs text-slate-500">∅</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
