import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import hiraganaArray from "../dictionary/hiragana";
import katakanaArray from "../dictionary/katakana";
import "../styles/UnliMode.css";

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

    const kanaPool = useMemo(() => {
        if (mode === "katakana") return katakanaArray;
        if (mode === "both") return [...hiraganaArray, ...katakanaArray];
        return hiraganaArray;
    }, [mode]);

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

    const charsetLabel = mode === "both" ? "Hiragana & Katakana"
        : mode === "katakana" ? "Katakana" : "Hiragana";

    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    return (
        <div className="quiz-container">
            <h2>{charsetLabel} Quiz</h2>

            <div className="stats">
                <div className="stat-item">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{score}</span>
                    {highScore > 0 && <span className="stat-best">Best: {highScore}</span>}
                </div>
                <div className="stat-item">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">{streak}</span>
                    {bestStreak > 0 && <span className="stat-best">Best: {bestStreak}</span>}
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
                <button onClick={showAnswer}>Show Answer</button>
                <button onClick={skipKana}>Skip</button>
            </div>

            {message && <p className={isCorrect ? "correct" : "wrong"}>{message}</p>}
            {answer && <p className="answer-reveal">Answer: {answer}</p>}

            <div className="quiz-actions">
                <button className="reset-btn" onClick={handleReset}>Reset Score</button>
                <button className="back-btn" onClick={() => navigate("/")}>Back to Menu</button>
            </div>
        </div>
    );
}
