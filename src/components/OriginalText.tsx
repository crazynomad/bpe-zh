import { isPunctuation } from "../colors";

interface Props {
  text: string;
  showInfo: boolean; // 关：自然文本流；开：逐字符方格 + Unicode 码位 + 字节数
}

const enc = new TextEncoder();

export default function OriginalText({ text, showInfo }: Props) {
  // 默认模式：自然文本流（像正常段落一样读），不拆方格。
  if (!showInfo) {
    return (
      <p
        className="whitespace-pre-wrap break-all text-base leading-relaxed"
        style={{ color: "var(--ink)" }}
      >
        {text}
      </p>
    );
  }

  // 显示字符编码模式：逐字符方格，背景按字节数着色，下标显示 Unicode 码位与字节数。
  const chars = Array.from(text); // 按码点切分，emoji 也安全

  return (
    <div className="flex flex-wrap gap-1">
      {chars.map((ch, i) => {
        const n = enc.encode(ch).length;
        const cp = ch.codePointAt(0) ?? 0;
        const punct = isPunctuation(ch);

        const bg = punct
          ? "transparent"
          : n >= 3
          ? "color-mix(in srgb, var(--warn) 12%, transparent)"
          : "color-mix(in srgb, var(--accent-2) 10%, transparent)";

        return (
          <span
            key={i}
            className="inline-flex min-w-[1.1em] flex-col items-center rounded px-1.5 py-0.5"
            style={{ background: bg, opacity: punct ? 0.5 : 1 }}
            title={`U+${cp.toString(16).toUpperCase().padStart(4, "0")} · ${n} 字节`}
          >
            <span
              className="whitespace-pre text-base"
              style={{ color: punct ? "var(--ink-dim)" : "var(--ink)" }}
            >
              {ch === "\n" ? "↵" : ch}
            </span>
            <span
              className="mt-0.5 font-mono-zh text-[10px] leading-none"
              style={{ color: "var(--ink-dim)" }}
            >
              U+{cp.toString(16).toUpperCase().padStart(4, "0")}
              <span style={{ color: n >= 3 ? "var(--warn)" : "var(--accent-2)" }}>
                {" "}
                ·{n}B
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
