import attentionEn from "./presets/attention-en.txt?raw";
import liuJiakun from "./presets/liu-jiakun.txt?raw";

const DREAM_EN = `I say to you today, my friends, so even though we face the difficulties of today and tomorrow, I still have a dream. It is a dream deeply rooted in the American dream.

I have a dream that one day this nation will rise up and live out the true meaning of its creed: "We hold these truths to be self-evident, that all men are created equal."

I have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood.

I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice, sweltering with the heat of oppression, will be transformed into an oasis of freedom and justice.

I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.

I have a dream today!`;

const DREAM_ZH = `朋友们，今天我要对你们说，尽管眼前和未来我们仍面临着重重困难，但我依然有一个梦想。这个梦想深深根植于美国梦之中。

我梦想有一天，这个国家会站立起来，真正实现其信条的真谛：“我们认为这些真理是不言而喻的：人人生而平等。”

我梦想有一天，在佐治亚州的红山上，昔日奴隶的儿子能够与昔日奴隶主的儿子同席而坐，共叙兄弟情谊。

我梦想有一天，甚至连密西西比州这个正被不公的烈火烤炙、被压迫的狂热蹂躏的荒凉之州，也能蜕变为自由和正义的绿洲。

我梦想有一天，我的四个孩子将生活在一个不以肤色、而以品格优劣来评判他们的国度里。

今天，我有一个梦想！`;

const JOBS = `Stay hungry. Stay foolish.

Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking.

The people who are crazy enough to think they can change the world are the ones who do.

Design is not just what it looks like and feels like. Design is how it works.

Innovation distinguishes between a leader and a follower.

Remembering that you are going to die is the best way I know to avoid the trap of thinking you have something to lose. You are already naked. There is no reason not to follow your heart.`;

export const PRESETS: { label: string; text: string }[] = [
  { label: "I Have a Dream · 英", text: DREAM_EN },
  { label: "I Have a Dream · 双语", text: `${DREAM_EN}\n\n${DREAM_ZH}` },
  { label: "乔布斯经典名句", text: JOBS },
  { label: "Attention Is All You Need · 英（全文）", text: attentionEn.trim() },
  { label: "刘家琨获奖感言 · 双语", text: liuJiakun.trim() },
];

export const DEFAULT_TEXT = PRESETS[0].text;
