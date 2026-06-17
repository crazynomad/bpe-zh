import type { ByteToken } from "./bpe";

// 给"已凑成完整字符"的 token 按 id 取一个稳定色相：同一个 token 永远同色，
// 便于观众看出反复被合并出来的大单元。半个字符的裸字节统一用灰色。
export interface ChipStyle {
  bg: string;
  border: string;
  color: string;
  mono: boolean;
}

const PARTIAL: ChipStyle = {
  bg: "rgba(148,163,184,0.12)",
  border: "rgba(148,163,184,0.35)",
  color: "#94a3b8",
  mono: true,
};

// 弱化样式：用于标点符号，降低存在感，让注意力集中在文字内容上。
const MUTED: ChipStyle = {
  bg: "transparent",
  border: "rgba(100,116,139,0.25)",
  color: "#64748b",
  mono: false,
};

// 是否为（整体由）标点符号构成。\p{P} 覆盖中英文标点（，。！？,.!? 等）。
export function isPunctuation(text: string): boolean {
  return text.length > 0 && /^\p{P}+$/u.test(text);
}

export function chipStyle(token: ByteToken): ChipStyle {
  if (!token.complete) return PARTIAL;
  if (isPunctuation(token.text)) return MUTED;

  // 基础 ASCII（单字节完整字符）用低饱和的蓝灰，和"合并产物"区分开
  if (token.bytes.length === 1) {
    return {
      bg: "rgba(96,165,250,0.14)",
      border: "rgba(96,165,250,0.4)",
      color: "#bfdbfe",
      mono: true,
    };
  }

  // 多字节完整 token：按 id 散列取色相；字节越多越饱和（合并得越多 = 越"成形"）
  const hue = (token.id * 47) % 360;
  const sat = Math.min(70, 38 + token.bytes.length * 6);
  return {
    bg: `hsl(${hue} ${sat}% 22% / 0.85)`,
    border: `hsl(${hue} ${sat}% 55%)`,
    color: `hsl(${hue} ${Math.min(90, sat + 25)}% 82%)`,
    mono: false,
  };
}
