import { getKanaPool, type KanaChar } from "./kanaPool";

export type { KanaChar };

function fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function generateSequence(charset: string, count = 120): KanaChar[] {
    const pool = getKanaPool(charset);

    const sequence: KanaChar[] = [];
    while (sequence.length < count) {
        const shuffled = fisherYatesShuffle(pool);
        sequence.push(...shuffled);
    }
    return sequence.slice(0, count);
}
