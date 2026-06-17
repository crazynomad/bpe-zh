import type { Step } from "../bpe";

interface Props {
  step: Step;
  byteLength: number;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-slate-100">{value}</div>
      {hint && <div className="text-[10px] text-slate-500">{hint}</div>}
    </div>
  );
}

export default function Stats({ step, byteLength }: Props) {
  const tokenCount = step.tokenIds.length;
  const ratio = tokenCount > 0 ? byteLength / tokenCount : 0;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="原始字节数" value={String(byteLength)} hint="UTF-8 编码后" />
      <Stat label="当前 token 数" value={String(tokenCount)} hint={`第 ${step.index} 步`} />
      <Stat label="压缩率" value={`${ratio.toFixed(2)}×`} hint="字节 ÷ token" />
      <Stat label="词表大小" value={String(step.vocabSize)} hint="基础字节 + 合并数" />
    </div>
  );
}
