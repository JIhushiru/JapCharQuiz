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

    const handleCheck = () => {
        if (userGuess.trim().toLowerCase() === currentKana.romaji) {
            setMessage("Correct!");
            setUserGuess("");
            setAnswer("");
            setCurrentKana(getRandomKana());
        } else {
            setMessage("Try again!");
        }
    };

    const showAnswer = () => {
        setAnswer(currentKana.romaji);
    };

    const charsetLabel = charset === "both" ? "Hiragana & Katakana"
        : charset === "katakana" ? "Katakana" : "Hiragana";

    return (
        <>
            <h2>{charsetLabel} Quiz</h2>
            <div className="currentKana">{currentKana.kana}</div>

            <div className="guess">
                <input
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    placeholder="Type romaji..."
                />
                <button onClick={handleCheck}>Guess</button>
                <button onClick={showAnswer}>Show Answer</button>
            </div>

            <p>{message}</p>
            {answer && <p>Answer: {answer}</p>}

            <button onClick={() => navigate("/")}>Back</button>
        </>
    );
}
