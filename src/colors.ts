import type { ByteToken } from "./bpe";

// Stage Dusk 冷区 token 配色。对齐品牌 ds-token 语汇：
//  - 半个字符的裸字节  → ds-token--ghost（虚线、ink-dim），表示"还没成形"
//  - 标点              → 弱化（ink-dim）
//  - 完整单字节 ASCII  → AI 蓝 accent-2
//  - 完整多字节字符    → 按 id 取稳定色相（功能性：同 token 同色），调到暗舞台上耐看
export interface ChipStyle {
  bg: string;
  border: string;
  color: string;
  mono: boolean;
  dashed?: boolean;
}

// 半字节裸字节：品牌 ghost 槽（虚线边、暗字、透明底）
const PARTIAL: ChipStyle = {
  bg: "transparent",
  border: "rgba(106,112,128,0.55)",
  color: "#6a7080",
  mono: true,
  dashed: true,
};

// 标点弱化
const MUTED: ChipStyle = {
  bg: "transparent",
  border: "rgba(106,112,128,0.3)",
  color: "#6a7080",
  mono: false,
};

// 是否为（整体由）标点符号构成。\p{P} 覆盖中英文标点（，。！？,.!? 等）。
export function isPunctuation(text: string): boolean {
  return text.length > 0 && /^\p{P}+$/u.test(text);
}

// token 展示用：把不可见空白替换成可见符号，否则 "␣t"（空格+字母）会看起来和单独的 "t" 一样。
// 仅用于 token 类组件（token 序列 / 词表 / 步骤条 / 合并产物），原文面板保持自然显示。
export function showToken(text: string): string {
  return text.replace(/ /g, "␣").replace(/\n/g, "↵").replace(/\t/g, "⇥");
}

export function chipStyle(token: ByteToken): ChipStyle {
  if (!token.complete) return PARTIAL;
  if (isPunctuation(token.text)) return MUTED;

  // 完整单字节 ASCII → AI 蓝（accent-2）
  if (token.bytes.length === 1) {
    return {
      bg: "color-mix(in srgb, #60a5fa 10%, #0a0a0c)",
      border: "rgba(96,165,250,0.45)",
      color: "#bfdbfe",
      mono: true,
    };
  }

  // 完整多字节 token：按 id 散列取色相；字节越多越饱和（合并得越多 = 越"成形"）。
  // 限定在青—蓝—紫—琥珀的暖冷区间，避开品牌否决的蓝紫渐变滥用，整体贴合暗舞台。
  const hue = (token.id * 47) % 360;
  const sat = Math.min(60, 34 + token.bytes.length * 5);
  return {
    bg: `hsl(${hue} ${sat}% 16% / 0.9)`,
    border: `hsl(${hue} ${sat}% 52%)`,
    color: `hsl(${hue} ${Math.min(85, sat + 28)}% 80%)`,
    mono: false,
  };
}
