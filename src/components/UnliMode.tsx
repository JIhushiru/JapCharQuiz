import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
            setMessage("Correct!");
            setScore(prev => prev + 1);
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) setBestStreak(newStreak);
            setUserGuess("");
            setAnswer("");
            setCurrentKana(getRandomKana());
        } else {
            setMessage("Try again!");
            setStreak(0);
        }
    };

    const skipKana = () => {
        setAnswer("");
        setMessage("");
        setUserGuess("");
        setStreak(0);
        setCurrentKana(getRandomKana());
    };

    const showAnswer = () => {
        setAnswer(currentKana.romaji);
    };

    const charsetLabel = mode === "both" ? "Hiragana & Katakana"
        : mode === "katakana" ? "Katakana" : "Hiragana";

    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    return (
        <div className="quiz-container">
            <h2>{charsetLabel} Quiz</h2>

            <div className="stats">
                <span>Score: {score} {highScore > 0 && <small>(Best: {highScore})</small>}</span>
                <span>Streak: {streak} {bestStreak > 0 && <small>(Best: {bestStreak})</small>}</span>
                <span>Accuracy: {accuracy}%</span>
            </div>

            <div className="currentKana">{currentKana.kana}</div>

            <div className="guess">
                <input
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    placeholder="Type romaji..."
                    autoFocus
                />
                <button onClick={handleCheck}>Guess</button>
                <button onClick={showAnswer}>Show Answer</button>
                <button onClick={skipKana}>Skip</button>
            </div>

            <p className={message === "Correct!" ? "correct" : "wrong"}>{message}</p>
            {answer && <p className="answer-reveal">Answer: {answer}</p>}

            <button className="back-btn" onClick={() => navigate("/")}>Back to Menu</button>
        </div>
    );
}
