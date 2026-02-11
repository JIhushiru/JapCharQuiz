import hiraganaArray from "../dictionary/hiragana";
import katakanaArray from "../dictionary/katakana";

export interface KanaChar {
    kana: string;
    romaji: string;
}

function fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function generateSequence(charset: string, count = 120): KanaChar[] {
    let pool: KanaChar[];
    if (charset === "katakana") pool = katakanaArray;
    else if (charset === "both") pool = [...hiraganaArray, ...katakanaArray];
    else pool = hiraganaArray;

    const sequence: KanaChar[] = [];
    while (sequence.length < count) {
        const shuffled = fisherYatesShuffle(pool);
        sequence.push(...shuffled);
    }
    return sequence.slice(0, count);
}
