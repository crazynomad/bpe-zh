import { isPunctuation } from "../colors";

interface Props {
  text: string;
  showInfo: boolean; // 是否显示字符的 Unicode 码位 + 字节数下标
}

const enc = new TextEncoder();

// 原文参考行：逐字符展示。
// 背景按字节数着色（一个汉字 = 3 字节，一个英文字母 = 1 字节——中文费 token 的根源）；
// showInfo 打开时，下标显示该字符的 Unicode 码位与字节数；标点弱化显示。
export default function OriginalText({ text, showInfo }: Props) {
  const chars = Array.from(text); // 按码点切分，emoji 也安全

  return (
    <div className="flex flex-wrap gap-1">
      {chars.map((ch, i) => {
        const n = enc.encode(ch).length;
        const cp = ch.codePointAt(0) ?? 0;
        const isSpace = ch === " " || ch === "\n";
        const punct = isPunctuation(ch);

        const bg = punct
          ? "transparent"
          : n >= 3
          ? "rgba(244,114,182,0.12)"
          : "rgba(96,165,250,0.1)";

        return (
          <span
            key={i}
            className="inline-flex flex-col items-center rounded px-1.5 py-0.5"
            style={{ background: bg, opacity: punct ? 0.5 : 1 }}
            title={`U+${cp.toString(16).toUpperCase().padStart(4, "0")} · ${n} 字节`}
          >
            <span
              className="text-base"
              style={{ color: punct ? "#64748b" : undefined }}
            >
              {isSpace ? "␣" : ch}
            </span>
            {showInfo && (
              <span className="mt-0.5 font-mono-zh text-[10px] leading-none text-slate-500">
                U+{cp.toString(16).toUpperCase().padStart(4, "0")}
                <span style={{ color: n >= 3 ? "#f9a8d4" : "#93c5fd" }}>
                  {" "}
                  ·{n}B
                </span>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
