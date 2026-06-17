interface Props {
  text: string;
}

// 原文参考行：逐字符展示，并标注每个字符占几个 UTF-8 字节。
// 直观呈现"一个汉字 = 3 字节，一个英文字母 = 1 字节"——中文费 token 的根源。
export default function OriginalText({ text }: Props) {
  const enc = new TextEncoder();
  const chars = Array.from(text); // 按码点切分，emoji 也安全

  return (
    <div className="flex flex-wrap gap-1">
      {chars.map((ch, i) => {
        const n = enc.encode(ch).length;
        const isSpace = ch === " " || ch === "\n";
        return (
          <span
            key={i}
            className="inline-flex flex-col items-center rounded px-1.5 py-0.5"
            style={{
              background: n >= 3 ? "rgba(244,114,182,0.12)" : "rgba(96,165,250,0.1)",
            }}
            title={`${n} 个 UTF-8 字节`}
          >
            <span className="text-base">{isSpace ? "␣" : ch}</span>
            <span
              className="text-[10px]"
              style={{ color: n >= 3 ? "#f9a8d4" : "#93c5fd" }}
            >
              {n}B
            </span>
          </span>
        );
      })}
    </div>
  );
}
