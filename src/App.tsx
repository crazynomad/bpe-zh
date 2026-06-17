import { useEffect, useMemo, useRef, useState } from "react";
import { trainBPE } from "./bpe";
import TokenRow from "./components/TokenRow";
import VocabularyTable from "./components/VocabularyTable";
import MergeProduct from "./components/MergeProduct";
import StepsBar from "./components/StepsBar";
import Stats from "./components/Stats";
import OriginalText from "./components/OriginalText";

const PRESETS: { label: string; text: string }[] = [
  { label: "重复词", text: "你好你好你好你好" },
  { label: "古诗", text: "床前明月光，疑是地上霜。" },
  { label: "中英混合", text: "用 GPT 做 AI 应用，AI 真有意思。" },
  { label: "机器学习", text: "机器学习改变世界，机器学习无处不在。" },
  { label: "英文对照", text: "the quick brown fox the lazy dog" },
];

const SPEEDS = [0.5, 1, 2, 4];

export default function App() {
  const [text, setText] = useState("机器学习改变世界，机器学习无处不在。");
  const [maxMerges, setMaxMerges] = useState(60);
  const [minFrequency, setMinFrequency] = useState(2);
  const [showIds, setShowIds] = useState(false);
  const [showCharInfo, setShowCharInfo] = useState(true);
  const [vocabTopN, setVocabTopN] = useState(10);

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const result = useMemo(
    () => trainBPE(text, { maxMerges, minFrequency }),
    [text, maxMerges, minFrequency]
  );
  const lastIndex = result.steps.length - 1;

  // 输入或参数变化时重置到第 0 步
  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
  }, [text, maxMerges, minFrequency]);

  // 播放循环：按速度推进，到末尾自动停止
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    if (current >= lastIndex) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => {
      setCurrent((c) => Math.min(c + 1, lastIndex));
    }, 900 / speed);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, current, speed, lastIndex]);

  const step = result.steps[Math.min(current, lastIndex)];

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 2xl:max-w-[2240px] 2xl:px-8">
      <header className="mb-6">
        <div className="ds-eyebrow mb-2">绿皮火车 · TOKEN 经济学 · 字节级 BPE</div>
        <h1
          className="text-3xl sm:text-4xl"
          style={{
            fontWeight: 250,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          中文 BPE 分词可视化
          <span
            className="ml-3 align-middle text-sm font-normal"
            style={{ color: "var(--accent)" }}
          >
            字节级
          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          真实大模型分词器在 <b style={{ color: "var(--ink)" }}>UTF-8 字节</b> 上做 BPE 合并。
          一个汉字 = 3 字节，所以中文要先把字节"拼回"汉字，再继续合并——
          这就是<b style={{ color: "var(--warn)" }}>中文比英文更费 token</b> 的根源。
        </p>
      </header>

      {/* 输入区 */}
      <section className="ds-card mb-5 p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setText(p.text)}
              className="rounded-full px-3 py-1 text-xs transition"
              style={{
                border: "1px solid var(--ink-faint)",
                color: "var(--ink-muted)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full resize-y rounded-lg p-3 outline-none"
          style={{
            border: "1px solid var(--ink-faint)",
            background: "#000",
            color: "var(--ink)",
          }}
          placeholder="输入要分词的文本…"
        />
        <div
          className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
          style={{ color: "var(--ink-dim)", accentColor: "var(--accent)" }}
        >
          <label className="flex items-center gap-2">
            最大合并次数
            <input
              type="range"
              min={1}
              max={120}
              value={maxMerges}
              onChange={(e) => setMaxMerges(Number(e.target.value))}
            />
            <span className="w-8 tabular-nums" style={{ color: "var(--ink)" }}>{maxMerges}</span>
          </label>
          <label className="flex items-center gap-2">
            最小频次
            <input
              type="range"
              min={2}
              max={8}
              value={minFrequency}
              onChange={(e) => setMinFrequency(Number(e.target.value))}
            />
            <span className="w-6 tabular-nums" style={{ color: "var(--ink)" }}>{minFrequency}</span>
          </label>
          <label className="flex items-center gap-2">
            词表显示数量
            <input
              type="range"
              min={5}
              max={30}
              value={vocabTopN}
              onChange={(e) => setVocabTopN(Number(e.target.value))}
            />
            <span className="w-6 tabular-nums" style={{ color: "var(--ink)" }}>{vocabTopN}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showCharInfo}
              onChange={(e) => setShowCharInfo(e.target.checked)}
            />
            显示字符编码（Unicode）
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showIds}
              onChange={(e) => setShowIds(e.target.checked)}
            />
            显示 token id
          </label>
        </div>
      </section>

      {/* 控制条 */}
      <section className="ds-card mb-5 flex flex-wrap items-center gap-3 p-3">
        <button
          onClick={() => {
            setCurrent(0);
            setPlaying(false);
          }}
          className="ds-btn px-3 py-1.5 text-sm"
        >
          ⏮ 重置
        </button>
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="ds-btn px-3 py-1.5 text-sm"
        >
          ⏪ 上一步
        </button>
        <button
          onClick={() => {
            if (current >= lastIndex) setCurrent(0);
            setPlaying((p) => !p);
          }}
          className="ds-btn ds-btn--accent px-4 py-1.5 text-sm"
        >
          {playing ? "⏸ 暂停" : "▶ 播放"}
        </button>
        <button
          onClick={() => setCurrent((c) => Math.min(lastIndex, c + 1))}
          disabled={current >= lastIndex}
          className="ds-btn px-3 py-1.5 text-sm"
        >
          下一步 ⏩
        </button>

        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--ink-dim)" }}>
          速度
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="rounded px-2 py-1"
              style={
                speed === s
                  ? {
                      background: "color-mix(in srgb, var(--accent) 18%, transparent)",
                      color: "var(--accent)",
                    }
                  : { color: "var(--ink-dim)" }
              }
            >
              {s}×
            </button>
          ))}
        </div>

        <div className="ml-auto text-sm tabular-nums" style={{ color: "var(--ink-muted)" }}>
          第 <b style={{ color: "var(--ink)" }}>{step.index}</b> / {lastIndex} 步
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded"
          style={{ background: "color-mix(in srgb, var(--ink) 10%, transparent)" }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${lastIndex ? (step.index / lastIndex) * 100 : 0}%`,
              background: "var(--accent)",
              boxShadow: "var(--glow-accent)",
            }}
          />
        </div>
      </section>

      <Stats step={step} byteLength={result.byteLength} />

      {/* 刚刚合并提示 */}
      <div className="my-4 min-h-[2rem]">
        {step.merge ? (
          <div
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
            style={{
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
              color: "var(--ink)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>第 {step.index} 步合并</span>
            <span className="font-mono-zh">
              {tokenText(result, step.merge.a)}
              <span className="mx-1" style={{ color: "var(--ink-dim)" }}>+</span>
              {tokenText(result, step.merge.b)}
              <span className="mx-1" style={{ color: "var(--ink-dim)" }}>→</span>
              <b>{tokenText(result, step.merge.newId)}</b>
            </span>
            <span style={{ color: "var(--ink-dim)" }}>（频次 N={step.merge.count}）</span>
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
            style={{
              background: "color-mix(in srgb, var(--ink) 5%, transparent)",
              color: "var(--ink-muted)",
            }}
          >
            初始状态：每个字符已按 UTF-8 拆成裸字节（虚线灰块 = 还不是完整字符）
          </div>
        )}
      </div>

      {/* 响应式：窄屏自上而下堆叠；≥lg 三栏并排（a 原文 / b token 序列 / c 词表+合并产物）。
          minmax(0,…) 让超长 token 行收缩换行而非撑破栏宽，支持一直放大到超宽屏。 */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,2fr)_minmax(280px,340px)]">
        <Panel title="原文" className="lg:max-h-[75vh]">
          <OriginalText text={text} showInfo={showCharInfo} />
        </Panel>
        <Panel title="当前 token 序列" className="lg:max-h-[75vh]">
          <TokenRow step={step} tokens={result.tokens} showIds={showIds} />
        </Panel>
        <div className="flex flex-col gap-4 lg:max-h-[75vh]">
          <Panel title="当前词表（按合并时间逆序）" className="min-h-0 flex-1">
            <VocabularyTable step={step} tokens={result.tokens} topN={vocabTopN} />
          </Panel>
          <Panel title="本步生成 token" className="shrink-0">
            <MergeProduct step={step} tokens={result.tokens} />
          </Panel>
        </div>
      </div>

      {/* BPE 步骤条：横向、全宽，显示在可视化下方 */}
      <div className="ds-card mt-5 p-4">
        <div className="ds-eyebrow ds-eyebrow--dim mb-3">BPE 步骤 · 点击跳转</div>
        <StepsBar
          steps={result.steps.slice(0, step.index + 1)}
          tokens={result.tokens}
          current={step.index}
          onSelect={(i) => {
            setPlaying(false);
            setCurrent(i);
          }}
        />
      </div>

      <footer
        className="mt-10 pt-4 text-center text-xs"
        style={{ borderTop: "1px solid color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--ink-dim)" }}
      >
        字节级 BPE 演示 · 绿皮火车 · 虚线灰块 = 半个字符的裸字节，彩色块 = 已拼成完整字符
      </footer>
    </div>
  );
}

function tokenText(result: ReturnType<typeof trainBPE>, id: number): string {
  const t = result.tokens.get(id);
  if (!t) return "?";
  return t.text === " " ? "␣" : t.text;
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  // flex 列：标题固定（shrink-0），正文在超出高度上限时自身滚动。
  return (
    <div className={`ds-card flex flex-col ${className ?? ""}`}>
      <div className="ds-eyebrow ds-eyebrow--dim shrink-0 px-4 pt-4 pb-2">
        {title}
      </div>
      <div className="min-h-0 overflow-y-auto px-4 pb-4">{children}</div>
    </div>
  );
}
