import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
    const navigate = useNavigate();
    return(
        <div className="home">
            <h1>Japanese Quiz Game</h1>
            <p className="subtitle">Test your knowledge of Japanese characters</p>

            <div className="mode-select">
                <h2>Choose a character set</h2>
                <div className="mode-buttons">
                    <button onClick={() => navigate("/quiz/hiragana")}>Hiragana</button>
                    <button onClick={() => navigate("/quiz/katakana")}>Katakana</button>
                    <button onClick={() => navigate("/quiz/both")}>Both</button>
                </div>
            </div>
        </div>
    );
}
