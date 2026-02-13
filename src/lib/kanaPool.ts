import hiraganaArray, { hiraganaBasic } from "../dictionary/hiragana";
import katakanaArray, { katakanaBasic } from "../dictionary/katakana";

export interface KanaChar {
    kana: string;
    romaji: string;
}

export function getKanaPool(mode: string): KanaChar[] {
    switch (mode) {
        case "katakana":        return katakanaArray;
        case "both":            return [...hiraganaArray, ...katakanaArray];
        case "hiragana-basic":  return hiraganaBasic;
        case "katakana-basic":  return katakanaBasic;
        case "both-basic":      return [...hiraganaBasic, ...katakanaBasic];
        default:                return hiraganaArray;
    }
}

export function getCharsetLabel(mode: string): string {
    const isBasic = mode.endsWith("-basic");
    const base = mode.replace("-basic", "");
    const name = base === "both" ? "Hiragana & Katakana"
        : base === "katakana" ? "Katakana" : "Hiragana";
    return isBasic ? `${name} (Basic)` : name;
}
