import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { getKanaPool, getCharsetLabel } from "../lib/kanaPool";

function getHighScore(charset: string): number {
    const saved = localStorage.getItem(`highscore-${charset}`);
    return saved ? parseInt(saved, 10) : 0;
}

function getBestStreak(charset: string): number {
    const saved = localStorage.getItem(`beststreak-${charset}`);
    return saved ? parseInt(saved, 10) : 0;
}

export default function UnliMode() {
    const { charset } = useParams<{ charset: string }>();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const mode = charset || "hiragana";

    const kanaPool = useMemo(() => getKanaPool(mode), [mode]);

    const getRandomKana = () => {
        return kanaPool[Math.floor(Math.random() * kanaPool.length)];
    };

    const [currentKana, setCurrentKana] = useState(() => getRandomKana());
    const [userGuess, setUserGuess] = useState("");
    const [message, setMessage] = useState("");
    const [answer, setAnswer] = useState("");
    const [score, setScore] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(() => getBestStreak(mode));
    const [highScore, setHighScore] = useState(() => getHighScore(mode));
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (isCorrect !== null) {
            const timer = setTimeout(() => {
                setIsCorrect(null);
                setMessage("");
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isCorrect]);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem(`highscore-${mode}`, score.toString());
        }
    }, [score, highScore, mode]);

    useEffect(() => {
        if (bestStreak > getBestStreak(mode)) {
            localStorage.setItem(`beststreak-${mode}`, bestStreak.toString());
        }
    }, [bestStreak, mode]);

    const handleCheck = () => {
        if (!userGuess.trim()) return;

        setTotalAttempts(prev => prev + 1);

        if (userGuess.trim().toLowerCase() === currentKana.romaji) {
            setIsCorrect(true);
            if (revealed) {
                setMessage("Correct, but answer was revealed");
            } else {
                setMessage("Correct!");
                setScore(prev => prev + 1);
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > bestStreak) setBestStreak(newStreak);
            }
            setUserGuess("");
            setAnswer("");
            setRevealed(false);
            setCurrentKana(getRandomKana());
        } else {
            setMessage("Try again!");
            setIsCorrect(false);
            setStreak(0);
        }
        inputRef.current?.focus();
    };

    const skipKana = () => {
        setAnswer("");
        setMessage("");
        setUserGuess("");
        setIsCorrect(null);
        setRevealed(false);
        setStreak(0);
        setCurrentKana(getRandomKana());
        inputRef.current?.focus();
    };

    const showAnswer = () => {
        setAnswer(currentKana.romaji);
        setRevealed(true);
        setStreak(0);
    };

    const handleReset = () => {
        setScore(0);
        setTotalAttempts(0);
        setStreak(0);
        setMessage("");
        setAnswer("");
        setUserGuess("");
        setIsCorrect(null);
        setRevealed(false);
        setCurrentKana(getRandomKana());
        inputRef.current?.focus();
    };

    const charsetLabel = getCharsetLabel(mode);
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-125">
            <h2>{charsetLabel} Quiz</h2>

            <div className="flex gap-6 flex-wrap justify-center py-4 px-6 bg-white/5 rounded-xl w-full light:bg-black/4">
                <div className="flex flex-col items-center min-w-20">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Score</span>
                    <span className="text-xl font-semibold text-brand">{score}</span>
                    {highScore > 0 && <span className="text-[0.7rem] text-white/35 light:text-black/35">Best: {highScore}</span>}
                </div>
                <div className="flex flex-col items-center min-w-20">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Streak</span>
                    <span className="text-xl font-semibold text-brand">{streak}</span>
                    {bestStreak > 0 && <span className="text-[0.7rem] text-white/35 light:text-black/35">Best: {bestStreak}</span>}
                </div>
                <div className="flex flex-col items-center min-w-20">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Accuracy</span>
                    <span className="text-xl font-semibold text-brand">{accuracy}%</span>
                </div>
            </div>

            <div className={`font-kana text-8xl leading-tight my-4 select-none transition-colors duration-200 max-sm:text-6xl
                ${isCorrect === true ? "text-success light:text-success-light" : isCorrect === false ? "text-danger light:text-danger-light" : ""}`}>
                {currentKana.kana}
            </div>

            <div className="flex gap-2 flex-wrap justify-center max-sm:flex-col max-sm:items-center">
                <input
                    ref={inputRef}
                    value={userGuess}
                    onChange={(e) => { setUserGuess(e.target.value); setMessage(""); setIsCorrect(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    placeholder="Type romaji..."
                    className="w-45 text-center text-lg max-sm:w-full max-sm:max-w-62.5"
                    autoFocus
                />
                <button onClick={handleCheck}>Guess</button>
                <button onClick={showAnswer}>Show Answer</button>
                <button onClick={skipKana}>Skip</button>
            </div>

            {message && <p className={`font-semibold text-lg ${isCorrect ? "text-success light:text-success-light" : "text-danger light:text-danger-light"}`}>{message}</p>}
            {answer && <p className="text-warning text-lg light:text-warning-light">Answer: {answer}</p>}

            <div className="flex gap-4 mt-6">
                <button className="opacity-60 text-sm hover:opacity-100" onClick={handleReset}>Reset Score</button>
                <button className="opacity-60 text-sm hover:opacity-100" onClick={() => navigate("/")}>Back to Menu</button>
            </div>
        </div>
    );
}
