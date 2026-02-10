import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import hiraganaArray from "../dictionary/hiragana";
import katakanaArray from "../dictionary/katakana";
import "../styles/UnliMode.css";

export default function UnliMode() {
    const { charset } = useParams<{ charset: string }>();
    const navigate = useNavigate();

    const kanaPool = useMemo(() => {
        if (charset === "katakana") return katakanaArray;
        if (charset === "both") return [...hiraganaArray, ...katakanaArray];
        return hiraganaArray;
    }, [charset]);

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
    const [bestStreak, setBestStreak] = useState(0);

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
        setCurrentKana(getRandomKana());
    };

    const showAnswer = () => {
        setAnswer(currentKana.romaji);
    };

    const charsetLabel = charset === "both" ? "Hiragana & Katakana"
        : charset === "katakana" ? "Katakana" : "Hiragana";

    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

    return (
        <div className="quiz-container">
            <h2>{charsetLabel} Quiz</h2>

            <div className="stats">
                <span>Score: {score}</span>
                <span>Streak: {streak}</span>
                <span>Best: {bestStreak}</span>
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
