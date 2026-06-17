// 字节级 BPE（Byte-Level Byte Pair Encoding）训练过程引擎。
//
// 与"字符级"演示的关键区别：真实的大模型分词器（GPT-2 / GPT-4 等）先把文本
// UTF-8 编码成字节，再在字节序列上做合并。一个汉字 = 3 个 UTF-8 字节，所以
// "你好" 的起点是 6 个字节，而不是 2 个字符。这正是"中文为什么更费 token"的根源。

export interface ByteToken {
  id: number; // 稳定的 token id：基础字节用字节值（0-255），合并产物从 256 起递增
  bytes: number[]; // 这个 token 代表的原始字节
  text: string; // 展示用：完整字符则是汉字/字母，半个字符则是 hex（如 "E4"）
  complete: boolean; // bytes 是否构成合法且完整的 UTF-8 字符
}

export interface PairCount {
  a: number;
  b: number;
  count: number;
}

export interface MergeEvent {
  a: number;
  b: number;
  newId: number;
  count: number;
}

export interface Step {
  index: number; // 第几步（0 = 初始字节序列）
  tokenIds: number[]; // 当前 token-id 序列
  vocabSize: number; // 当前词表大小（不同基础字节数 + 已合并次数）
  merge: MergeEvent | null; // 产生这一步的合并（第 0 步为 null）
  topPairs: PairCount[]; // 该步的相邻对频率表（按频次降序）
}

export interface BpeResult {
  tokens: Map<number, ByteToken>; // id -> token，涵盖所有出现过的 token
  steps: Step[];
  originalText: string;
  byteLength: number;
}

const HEX = (b: number) => b.toString(16).toUpperCase().padStart(2, "0");

// 把字节序列尝试解码成字符。fatal:true 的解码器遇到不完整/非法 UTF-8 会抛异常，
// 我们用它来区分"完整字符"和"半个字符的裸字节"。
export function decodeBytes(bytes: number[]): { text: string; complete: boolean } {
  const arr = new Uint8Array(bytes);
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(arr);
    return { text, complete: true };
  } catch {
    return { text: bytes.map(HEX).join(" "), complete: false };
  }
}

// 统计相邻对频率，按频次降序；同频次时按首次出现位置靠前，保证确定性。
export function countPairs(seq: number[]): PairCount[] {
  const counts = new Map<string, { a: number; b: number; count: number; first: number }>();
  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i];
    const b = seq[i + 1];
    const key = a + "," + b;
    const e = counts.get(key);
    if (e) e.count++;
    else counts.set(key, { a, b, count: 1, first: i });
  }
  return [...counts.values()]
    .sort((x, y) => y.count - x.count || x.first - y.first)
    .map(({ a, b, count }) => ({ a, b, count }));
}

// 从左到右、不重叠地把序列中所有 (a,b) 对替换成 newId。
function applyMerge(seq: number[], a: number, b: number, newId: number): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < seq.length) {
    if (i < seq.length - 1 && seq[i] === a && seq[i + 1] === b) {
      out.push(newId);
      i += 2;
    } else {
      out.push(seq[i]);
      i++;
    }
  }
  return out;
}

export interface TrainOptions {
  maxMerges: number;
  minFrequency: number; // 低于此频次就停止合并（默认 2：至少出现两次才有压缩意义）
}

export function trainBPE(text: string, options: Partial<TrainOptions> = {}): BpeResult {
  const maxMerges = options.maxMerges ?? 50;
  const minFrequency = Math.max(2, options.minFrequency ?? 2);

  const bytes = Array.from(new TextEncoder().encode(text));

  const tokens = new Map<number, ByteToken>();
  for (const b of bytes) {
    if (!tokens.has(b)) {
      const d = decodeBytes([b]);
      tokens.set(b, { id: b, bytes: [b], text: d.text, complete: d.complete });
    }
  }

  const distinctBytes = new Set(bytes).size;
  let seq = bytes.slice();
  let nextId = 256;

  const steps: Step[] = [
    {
      index: 0,
      tokenIds: seq.slice(),
      vocabSize: distinctBytes,
      merge: null,
      topPairs: countPairs(seq),
    },
  ];

  for (let m = 0; m < maxMerges; m++) {
    const pairs = countPairs(seq);
    if (pairs.length === 0) break;
    const best = pairs[0];
    if (best.count < minFrequency) break;

    const newId = nextId++;
    const aTok = tokens.get(best.a)!;
    const bTok = tokens.get(best.b)!;
    const newBytes = [...aTok.bytes, ...bTok.bytes];
    const d = decodeBytes(newBytes);
    tokens.set(newId, { id: newId, bytes: newBytes, text: d.text, complete: d.complete });

    seq = applyMerge(seq, best.a, best.b, newId);

    steps.push({
      index: m + 1,
      tokenIds: seq.slice(),
      vocabSize: distinctBytes + (m + 1),
      merge: { a: best.a, b: best.b, newId, count: best.count },
      topPairs: countPairs(seq),
    });
  }

  return { tokens, steps, originalText: text, byteLength: bytes.length };
}
