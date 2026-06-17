import type { ByteToken, Step } from "../bpe";

interface Props {
  step: Step;
  tokens: Map<number, ByteToken>;
  limit?: number;
}

const show = (t: ByteToken) => (t.text === " " ? "␣" : t.text);

// 相邻对频率表。第 0 行（频次最高、下一步将被合并）高亮黄色，与 token 行呼应。
export default function FrequencyTable({ step, tokens, limit = 8 }: Props) {
  const rows = step.topPairs.slice(0, limit);

  if (rows.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        没有可合并的相邻对了 —— 训练结束。
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left text-slate-400">
          <th className="pb-2 font-normal">相邻对</th>
          <th className="pb-2 text-right font-normal">频次</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => {
          const a = tokens.get(p.a)!;
          const b = tokens.get(p.b)!;
          const top = i === 0;
          return (
            <tr
              key={`${p.a}-${p.b}`}
              style={{
                background: top ? "rgba(251,191,36,0.12)" : undefined,
              }}
            >
              <td className="py-1">
                <span className="font-mono-zh">
                  {show(a)}
                  <span className="mx-1 text-slate-500">+</span>
                  {show(b)}
                </span>
                {top && (
                  <span className="ml-2 rounded bg-amber-400/20 px-1.5 py-0.5 text-[11px] text-amber-300">
                    下一步合并
                  </span>
                )}
              </td>
              <td className="py-1 text-right tabular-nums text-slate-300">
                {p.count}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
