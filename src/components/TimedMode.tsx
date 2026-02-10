import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import hiraganaArray from "../dictionary/hiragana";
import katakanaArray from "../dictionary/katakana";
import "../styles/TimedMode.css";

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

    const kanaPool = useMemo(() => {
        if (mode === "katakana") return katakanaArray;
        if (mode === "both") return [...hiraganaArray, ...katakanaArray];
        return hiraganaArray;
    }, [mode]);

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

    // Countdown timer
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

    // Save high score and best streak on game end
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

    // Clear feedback flash
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

        // Always advance to next character
        setUserGuess("");
        setCurrentKana(getRandomKana());
        inputRef.current?.focus();
    };

    const charsetLabel = mode === "both" ? "Hiragana & Katakana"
        : mode === "katakana" ? "Katakana" : "Hiragana";

    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    if (phase === "idle") {
        return (
            <div className="quiz-container timed-container">
                <h2>{charsetLabel} — Timed Quiz</h2>
                <p className="timed-description">
                    Answer as many characters as you can in {GAME_DURATION} seconds.
                    Wrong answers auto-advance to the next character.
                </p>
                <button className="start-btn" onClick={startGame}>Start</button>
                <div className="timed-records">
                    {highScore > 0 && <p>High Score: {highScore}</p>}
                    {bestStreak > 0 && <p>Best Streak: {bestStreak}</p>}
                </div>
                <button className="back-btn" onClick={() => navigate("/")}>Back to Menu</button>
            </div>
        );
    }

    if (phase === "ended") {
        return (
            <div className="quiz-container timed-container">
                <h2>Time's Up!</h2>
                {isNewHighScore && <p className="new-highscore">New High Score!</p>}
                <div className="game-over-stats">
                    <div className="game-over-stat">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{score}</span>
                    </div>
                    <div className="game-over-stat">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value">{accuracy}%</span>
                    </div>
                    <div className="game-over-stat">
                        <span className="stat-label">Best Streak</span>
                        <span className="stat-value">{maxStreak}</span>
                    </div>
                    <div className="game-over-stat">
                        <span className="stat-label">Answered</span>
                        <span className="stat-value">{totalAttempts}</span>
                    </div>
                </div>
                <div className="game-over-actions">
                    <button onClick={startGame}>Play Again</button>
                    <button className="back-btn" onClick={() => navigate("/")}>Back to Menu</button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container timed-container">
            <h2>{charsetLabel} — Timed Quiz</h2>

            <div className={`timer-display ${timeLeft <= 10 ? "timer-warning" : ""}`}>
                {timeLeft}s
            </div>

            <div className="stats">
                <div className="stat-item">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{score}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">{streak}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{accuracy}%</span>
                </div>
            </div>

            <div className={`kana-display ${isCorrect === true ? "flash-correct" : isCorrect === false ? "flash-wrong" : ""}`}>
                {currentKana.kana}
            </div>

            <div className="guess">
                <input
                    ref={inputRef}
                    value={userGuess}
                    onChange={(e) => { setUserGuess(e.target.value); setMessage(""); setIsCorrect(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    placeholder="Type romaji..."
                    autoFocus
                />
                <button onClick={handleCheck}>Guess</button>
            </div>

            {message && <p className={isCorrect ? "correct" : "wrong"}>{message}</p>}
        </div>
    );
}
