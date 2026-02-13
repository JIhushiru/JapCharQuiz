import { useState } from "react";
import hiraganaArray from "../dictionary/hiragana";
import katakanaArray from "../dictionary/katakana";

type Tab = "hiragana" | "katakana";

const basicRows = [
  ["a", "i", "u", "e", "o"],
  ["ka", "ki", "ku", "ke", "ko"],
  ["sa", "shi", "su", "se", "so"],
  ["ta", "chi", "tsu", "te", "to"],
  ["na", "ni", "nu", "ne", "no"],
  ["ha", "hi", "fu", "he", "ho"],
  ["ma", "mi", "mu", "me", "mo"],
  ["ya", null, "yu", null, "yo"],
  ["ra", "ri", "ru", "re", "ro"],
  ["wa", null, null, null, "wo"],
  ["n", null, null, null, null],
];

const dakutenRows = [
  ["ga", "gi", "gu", "ge", "go"],
  ["za", "ji", "zu", "ze", "zo"],
  ["da", "dzi", "dzu", "de", "do"],
  ["ba", "bi", "bu", "be", "bo"],
  ["pa", "pi", "pu", "pe", "po"],
];

const comboRows = [
  ["kya", "kyu", "kyo"],
  ["sha", "shu", "sho"],
  ["cha", "chu", "cho"],
  ["nya", "nyu", "nyo"],
  ["hya", "hyu", "hyo"],
  ["mya", "myu", "myo"],
  ["rya", "ryu", "ryo"],
  ["gya", "gyu", "gyo"],
  ["ja", "ju", "jo"],
  ["bya", "byu", "byo"],
  ["pya", "pyu", "pyo"],
  ["dya", "dyu", "dyo"],
];

function buildLookup(arr: { kana: string; romaji: string }[]) {
  const map = new Map<string, string>();
  for (const c of arr) map.set(c.romaji, c.kana);
  return map;
}

function Cell({ romaji, lookup }: { romaji: string | null; lookup: Map<string, string> }) {
  if (!romaji) return <div className="w-16 h-16 max-sm:w-12 max-sm:h-12" />;
  const kana = lookup.get(romaji);
  if (!kana) return <div className="w-16 h-16 max-sm:w-12 max-sm:h-12" />;
  return (
    <div className="w-16 h-16 max-sm:w-12 max-sm:h-12 flex flex-col items-center justify-center rounded-lg
                    bg-white/5 border border-white/10 light:bg-black/3 light:border-black/8">
      <span className="font-kana text-xl max-sm:text-lg leading-none">{kana}</span>
      <span className="text-[10px] text-white/40 light:text-black/40 mt-0.5">{romaji}</span>
    </div>
  );
}

function Section({ title, rows, cols, lookup }: {
  title: string;
  rows: (string | null)[][];
  cols: number;
  lookup: Map<string, string>;
}) {
  return (
    <div>
      <h3 className="text-sm text-white/50 light:text-black/40 mb-2 text-left">{title}</h3>
      <div className="flex flex-col gap-1">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {row.map((r, j) => (
              <Cell key={j} romaji={r} lookup={lookup} />
            ))}
            {/* pad short rows to align with cols */}
            {Array.from({ length: cols - row.length }).map((_, j) => (
              <div key={`pad-${j}`} className="w-16 h-16 max-sm:w-12 max-sm:h-12" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CharChart({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("hiragana");
  const lookup = buildLookup(tab === "hiragana" ? hiraganaArray : katakanaArray);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
         onClick={onClose}>
      <div className="bg-bg-dark border border-white/15 rounded-2xl p-6 max-sm:p-4 max-h-[90vh] overflow-y-auto
                      light:bg-white light:border-black/10 animate-fade-in"
           onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Character Chart</h2>
          <button className="text-sm px-3 py-1" onClick={onClose}>Close</button>
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-5">
          <button
            className={`text-sm px-4 py-1.5 ${tab === "hiragana" ? "bg-brand/20 border-brand" : ""}`}
            onClick={() => setTab("hiragana")}
          >Hiragana</button>
          <button
            className={`text-sm px-4 py-1.5 ${tab === "katakana" ? "bg-brand/20 border-brand" : ""}`}
            onClick={() => setTab("katakana")}
          >Katakana</button>
        </div>

        {/* chart */}
        <div className="flex flex-col gap-5">
          <Section title="Basic" rows={basicRows} cols={5} lookup={lookup} />
          <Section title="Dakuten / Handakuten" rows={dakutenRows} cols={5} lookup={lookup} />
          <Section title="Combinations" rows={comboRows} cols={5} lookup={lookup} />
        </div>
      </div>
    </div>
  );
}
