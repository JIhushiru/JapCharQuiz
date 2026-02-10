import { useNavigate } from "react-router-dom";
import { useState } from "react";
import hiraganaArray from "../dictionary/hiragana";
import "../styles/UnliMode.css";

export default function UnliMode() {

    const getRandomKana = () => {
    return hiraganaArray[Math.floor(Math.random() * hiraganaArray.length)];
};


    const navigate = useNavigate();
    const [currentKana, setCurrentKana] = useState(()=>getRandomKana());
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
  }

  return (
    <>
      <h2>Let's play</h2>
      <div className="currentKana">{currentKana.kana}</div>

      <div className = 'guess'>
        <input
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder="Type romaji..."
        />
        <div></div>
        <button onClick={handleCheck}>Guess</button>
        <button onClick={showAnswer}>Show Answer</button>
      </div>

      <p>{message}</p>
      {answer && <p>Answer: {answer}</p>}

      <button onClick={() => navigate("/")}>Back</button>
    </>
  );
}
