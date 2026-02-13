import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { getKanaPool, getCharsetLabel } from "../lib/kanaPool";

type Phase = "idle" | "playing" | "ended";

const GAME_DURATION = 60;

function getHighScore(charset: string): number {
    const saved = localStorage.getItem(`timed-highscore-${charset}`);
    return saved ? parseInt(saved, 10) : 0;
}

function getBestStreak(charset: string): number {
    const saved = localStorage.getItem(`timed-beststreak-${charset}`);
    return saved ? parseInt(saved, 10) : 0;
}

export default function TimedMode() {
    const { charset } = useParams<{ charset: string }>();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const mode = charset || "hiragana";

    const kanaPool = useMemo(() => getKanaPool(mode), [mode]);

    const getRandomKana = useCallback(() => {
        return kanaPool[Math.floor(Math.random() * kanaPool.length)];
    }, [kanaPool]);

    const [phase, setPhase] = useState<Phase>("idle");
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [currentKana, setCurrentKana] = useState(() => getRandomKana());
    const [userGuess, setUserGuess] = useState("");
    const [message, setMessage] = useState("");
    const [score, setScore] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [highScore, setHighScore] = useState(() => getHighScore(mode));
    const [bestStreak, setBestStreak] = useState(() => getBestStreak(mode));
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isNewHighScore, setIsNewHighScore] = useState(false);

    useEffect(() => {
        if (phase !== "playing") return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setPhase("ended");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [phase]);

    useEffect(() => {
        if (phase !== "ended") return;
        if (score > highScore) {
            setHighScore(score);
            setIsNewHighScore(true);
            localStorage.setItem(`timed-highscore-${mode}`, score.toString());
        }
        if (maxStreak > bestStreak) {
            setBestStreak(maxStreak);
            localStorage.setItem(`timed-beststreak-${mode}`, maxStreak.toString());
        }
    }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isCorrect !== null) {
            const timer = setTimeout(() => {
                setIsCorrect(null);
                setMessage("");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isCorrect]);

    const startGame = () => {
        setPhase("playing");
        setTimeLeft(GAME_DURATION);
        setScore(0);
        setTotalAttempts(0);
        setStreak(0);
        setMaxStreak(0);
        setMessage("");
        setUserGuess("");
        setIsCorrect(null);
        setIsNewHighScore(false);
        setCurrentKana(getRandomKana());
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleCheck = () => {
        if (!userGuess.trim() || phase !== "playing") return;

        setTotalAttempts(prev => prev + 1);

        if (userGuess.trim().toLowerCase() === currentKana.romaji) {
            setIsCorrect(true);
            setMessage("Correct!");
            setScore(prev => prev + 1);
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);
        } else {
            setIsCorrect(false);
            setMessage(`${currentKana.romaji}`);
            setStreak(0);
        }

        setUserGuess("");
        setCurrentKana(getRandomKana());
        inputRef.current?.focus();
    };

    const charsetLabel = getCharsetLabel(mode);
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    if (phase === "idle") {
        return (
            <div className="flex flex-col items-center gap-3 w-full max-w-125">
                <h2>{charsetLabel} — Timed Quiz</h2>
                <p className="text-white/50 text-base max-w-87.5 leading-relaxed light:text-black/50">
                    Answer as many characters as you can in {GAME_DURATION} seconds.
                    Wrong answers auto-advance to the next character.
                </p>
                <button className="py-4 px-12 text-xl font-semibold bg-brand text-white my-4 hover:bg-brand-hover" onClick={startGame}>
                    Start
                </button>
                <div className="text-white/40 text-sm light:text-black/40">
                    {highScore > 0 && <p className="my-0.5">High Score: {highScore}</p>}
                    {bestStreak > 0 && <p className="my-0.5">Best Streak: {bestStreak}</p>}
                </div>
                <button className="opacity-60 text-sm hover:opacity-100" onClick={() => navigate("/")}>Back to Menu</button>
            </div>
        );
    }

    if (phase === "ended") {
        return (
            <div className="flex flex-col items-center gap-3 w-full max-w-125">
                <h2>Time's Up!</h2>
                {isNewHighScore && <p className="text-warning text-xl font-bold light:text-warning-light">New High Score!</p>}
                <div className="grid grid-cols-2 gap-5 p-6 bg-white/5 rounded-xl w-full max-w-80 light:bg-black/4 max-sm:p-4 max-sm:gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Score</span>
                        <span className="text-xl font-semibold text-brand">{score}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Accuracy</span>
                        <span className="text-xl font-semibold text-brand">{accuracy}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Best Streak</span>
                        <span className="text-xl font-semibold text-brand">{maxStreak}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Answered</span>
                        <span className="text-xl font-semibold text-brand">{totalAttempts}</span>
                    </div>
                </div>
                <div className="flex gap-4 mt-4 max-sm:flex-col max-sm:items-center">
                    <button onClick={startGame}>Play Again</button>
                    <button className="opacity-60 text-sm hover:opacity-100" onClick={() => navigate("/")}>Back to Menu</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-125">
            <h2>{charsetLabel} — Timed Quiz</h2>

            <div className={`text-4xl font-bold text-brand max-sm:text-3xl ${timeLeft <= 10 ? "animate-pulse-fast" : ""}`}>
                {timeLeft}s
            </div>

            <div className="flex gap-6 flex-wrap justify-center py-4 px-6 bg-white/5 rounded-xl w-full light:bg-black/4 max-sm:gap-4 max-sm:py-3 max-sm:px-4">
                <div className="flex flex-col items-center min-w-20">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Score</span>
                    <span className="text-xl font-semibold text-brand">{score}</span>
                </div>
                <div className="flex flex-col items-center min-w-20">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Streak</span>
                    <span className="text-xl font-semibold text-brand">{streak}</span>
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
            </div>

            {message && <p className={`font-semibold text-lg ${isCorrect ? "text-success light:text-success-light" : "text-danger light:text-danger-light"}`}>{message}</p>}
        </div>
    );
}
