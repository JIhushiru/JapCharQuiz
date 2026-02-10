import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

type Mode = "normal" | "timed";

export default function Home() {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState<Mode | null>(null);

    const handleCharset = (charset: string) => {
        if (selectedMode === "timed") {
            navigate(`/timed-quiz/${charset}`);
        } else {
            navigate(`/quiz/${charset}`);
        }
    };

    return(
        <div className="home">
            <h1>Japanese Quiz Game</h1>
            <p className="subtitle">Test your knowledge of Japanese characters</p>

            <div className="mode-select">
                <h2>Choose a game mode</h2>
                <div className="mode-cards">
                    <button
                        className={`mode-card ${selectedMode === "normal" ? "mode-card-selected" : ""}`}
                        onClick={() => setSelectedMode("normal")}
                    >
                        <span className="mode-card-title">Normal</span>
                        <span className="mode-card-desc">Practice at your own pace with unlimited time</span>
                    </button>
                    <button
                        className={`mode-card ${selectedMode === "timed" ? "mode-card-selected" : ""}`}
                        onClick={() => setSelectedMode("timed")}
                    >
                        <span className="mode-card-title">Timed</span>
                        <span className="mode-card-desc">Answer as many as you can in 60 seconds</span>
                    </button>
                </div>
            </div>

            {selectedMode && (
                <div className="charset-select">
                    <h2>Choose a character set</h2>
                    <div className="mode-buttons">
                        <button onClick={() => handleCharset("hiragana")}>Hiragana</button>
                        <button onClick={() => handleCharset("katakana")}>Katakana</button>
                        <button onClick={() => handleCharset("both")}>Both</button>
                    </div>
                </div>
            )}

            <p className="footer-note">Type the romaji for each character shown</p>
        </div>
    );
}
