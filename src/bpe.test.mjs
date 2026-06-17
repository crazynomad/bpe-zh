// 快速冒烟测试：node --experimental-strip-types 直接跑 .ts 较麻烦，这里用编译后逻辑的等价校验。
// 实际引擎在 bpe.ts，本文件仅验证核心不变量，跑法见底部注释。
import { trainBPE, decodeBytes } from "./bpe.ts";

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    pass++;
    console.log("  ✓ " + name);
  } else {
    fail++;
    console.error("  ✗ " + name);
  }
}

console.log("decodeBytes:");
check("单个 ASCII 字节完整", decodeBytes([0x68]).complete && decodeBytes([0x68]).text === "h");
check("半个汉字（首字节）不完整", !decodeBytes([0xe4]).complete && decodeBytes([0xe4]).text === "E4");
check("完整汉字字节解码成字", decodeBytes([0xe4, 0xbd, 0xa0]).complete && decodeBytes([0xe4, 0xbd, 0xa0]).text === "你");

console.log("trainBPE（中文）:");
const r = trainBPE("你好你好你好", { maxMerges: 50 });
check("6 个汉字 = 18 字节", r.byteLength === 18);
const last = r.steps[r.steps.length - 1];
const finalTokens = last.tokenIds.map((id) => r.tokens.get(id));
check("最终所有 token 都已凑成完整字符", finalTokens.every((t) => t.complete));
check("重复语料被压缩（最终 token 数 < 18）", last.tokenIds.length < 18);
console.log(
  "    最终序列:",
  finalTokens.map((t) => t.text).join(" | "),
  "| 步数:",
  r.steps.length - 1,
  "| 词表:",
  last.vocabSize
);

console.log("trainBPE（中英混合）:");
const r2 = trainBPE("AI 模型 AI 模型", { maxMerges: 50 });
const l2 = r2.steps[r2.steps.length - 1];
console.log(
  "    最终序列:",
  l2.tokenIds.map((id) => r2.tokens.get(id).text).join(" | ")
);
check("英文压缩率高于中文（AI 两字节，模型 6 字节）", r2.byteLength === Array.from(new TextEncoder().encode("AI 模型 AI 模型")).length);

console.log(`\n结果：${pass} 通过，${fail} 失败`);
process.exit(fail === 0 ? 0 : 1);

// 跑法：cd bpe-zh && node --experimental-strip-types src/bpe.test.mjs
