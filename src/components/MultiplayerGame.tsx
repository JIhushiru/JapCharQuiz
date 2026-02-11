import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    subscribeToRoom,
    updatePlayerScore,
    endGame,
    reconnectPlayer,
    type RoomData,
    type PlayerData,
} from "../lib/roomService";
import "../styles/Multiplayer.css";

const GAME_DURATION = 60;

type Phase = "loading" | "playing" | "ended";

export default function MultiplayerGame() {
    const { roomCode, player } = useParams<{ roomCode: string; player: string }>();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const code = roomCode || "";
    const me = (player || "player1") as "player1" | "player2";
    const opponent = me === "player1" ? "player2" : "player1";

    const [phase, setPhase] = useState<Phase>("loading");
    const [room, setRoom] = useState<RoomData | null>(null);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [userGuess, setUserGuess] = useState("");
    const [message, setMessage] = useState("");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Local state for my score (written to Firebase)
    const [myScore, setMyScore] = useState(0);
    const [myIndex, setMyIndex] = useState(0);
    const [myStreak, setMyStreak] = useState(0);
    const [myMaxStreak, setMyMaxStreak] = useState(0);
    const [myAttempts, setMyAttempts] = useState(0);

    // Reconnect on mount
    useEffect(() => {
        if (code && me) {
            reconnectPlayer(code, me);
        }
    }, [code, me]);

    // Subscribe to room
    useEffect(() => {
        if (!code) return;

        const unsub = subscribeToRoom(code, (data) => {
            setRoom(data);
            if (data) {
                if (data.status === "playing" && phase === "loading") {
                    setPhase("playing");
                    setTimeout(() => inputRef.current?.focus(), 50);
                } else if (data.status === "ended") {
                    setPhase("ended");
                }
            }
        });

        return unsub;
    }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

    // Timer based on startTime
    useEffect(() => {
        if (phase !== "playing" || !room?.startTime) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - room.startTime!) / 1000);
            const remaining = Math.max(0, GAME_DURATION - elapsed);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                setPhase("ended");
                endGame(code);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [phase, room?.startTime, code]);

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

    // Sync local state to Firebase
    const syncToFirebase = useCallback(
        (score: number, index: number, streak: number, maxStreak: number, attempts: number) => {
            updatePlayerScore(code, me, {
                score,
                currentIndex: index,
                streak,
                maxStreak,
                totalAttempts: attempts,
            });
        },
        [code, me]
    );

    const handleCheck = () => {
        if (!userGuess.trim() || phase !== "playing" || !room) return;

        const currentChar = room.characters[myIndex];
        if (!currentChar) return;

        const newAttempts = myAttempts + 1;
        setMyAttempts(newAttempts);

        if (userGuess.trim().toLowerCase() === currentChar.romaji) {
            setIsCorrect(true);
            setMessage("Correct!");
            const newScore = myScore + 1;
            const newStreak = myStreak + 1;
            const newMaxStreak = Math.max(newStreak, myMaxStreak);
            const newIndex = myIndex + 1;
            setMyScore(newScore);
            setMyStreak(newStreak);
            setMyMaxStreak(newMaxStreak);
            setMyIndex(newIndex);
            syncToFirebase(newScore, newIndex, newStreak, newMaxStreak, newAttempts);
        } else {
            setIsCorrect(false);
            setMessage(`${currentChar.romaji}`);
            const newIndex = myIndex + 1;
            setMyStreak(0);
            setMyIndex(newIndex);
            syncToFirebase(myScore, newIndex, 0, myMaxStreak, newAttempts);
        }

        setUserGuess("");
        inputRef.current?.focus();
    };

    const myData: PlayerData | null = room ? room[me] : null;
    const opponentData: PlayerData | null = room ? room[opponent] : null;

    // Use local state for my score display (faster), Firebase for opponent
    const myDisplayScore = myScore;
    const opponentScore = opponentData?.score ?? 0;
    const opponentStreak = opponentData?.streak ?? 0;
    const opponentConnected = opponentData?.connected ?? true;

    const currentChar = room?.characters?.[myIndex];

    const charsetLabel = room
        ? room.charset === "both" ? "Hiragana & Katakana"
            : room.charset === "katakana" ? "Katakana" : "Hiragana"
        : "";

    const myAccuracy = myAttempts > 0 ? Math.round((myScore / myAttempts) * 100) : 0;
    const opAccuracy = opponentData && opponentData.totalAttempts > 0
        ? Math.round((opponentData.score / opponentData.totalAttempts) * 100) : 0;

    // Loading
    if (phase === "loading") {
        return (
            <div className="mp-game-container">
                <p className="waiting-text">Connecting to game...</p>
            </div>
        );
    }

    // Results
    if (phase === "ended") {
        const finalMyScore = myData?.score ?? myScore;
        const finalOpScore = opponentData?.score ?? 0;
        const result = finalMyScore > finalOpScore ? "win"
            : finalMyScore < finalOpScore ? "lose" : "draw";

        const resultText = result === "win" ? "You Win!"
            : result === "lose" ? "You Lose!" : "It's a Draw!";

        return (
            <div className="mp-results">
                <h2>Time's Up!</h2>
                <p className={`mp-result-banner mp-result-${result}`}>{resultText}</p>

                <div className="mp-results-grid">
                    <div className="mp-result-player">
                        <h3>You</h3>
                        <span className="mp-result-score">{finalMyScore}</span>
                        <div className="mp-result-details">
                            <span>Accuracy: {myAccuracy}%</span>
                            <span>Best Streak: {myData?.maxStreak ?? myMaxStreak}</span>
                            <span>Answered: {myData?.totalAttempts ?? myAttempts}</span>
                        </div>
                    </div>
                    <div className="mp-result-player">
                        <h3>Opponent</h3>
                        <span className="mp-result-score">{finalOpScore}</span>
                        <div className="mp-result-details">
                            <span>Accuracy: {opAccuracy}%</span>
                            <span>Best Streak: {opponentData?.maxStreak ?? 0}</span>
                            <span>Answered: {opponentData?.totalAttempts ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className="mp-result-actions">
                    <button className="back-btn" onClick={() => navigate("/")}>Back to Menu</button>
                </div>
            </div>
        );
    }

    // Playing
    return (
        <div className="mp-game-container">
            <h2>{charsetLabel} — 1v1</h2>

            <div className={`timer-display ${timeLeft <= 10 ? "timer-warning" : ""}`}>
                {timeLeft}s
            </div>

            <div className="mp-scoreboard">
                <div className="mp-player-card is-you">
                    <span className="mp-player-label">You</span>
                    <span className="mp-player-score">{myDisplayScore}</span>
                    <span className="mp-player-streak">Streak: {myStreak}</span>
                </div>
                <div className="mp-player-card">
                    <span className="mp-player-label">Opponent</span>
                    <span className="mp-player-score">{opponentScore}</span>
                    <span className="mp-player-streak">Streak: {opponentStreak}</span>
                    {!opponentConnected && (
                        <span className="mp-disconnected">Disconnected</span>
                    )}
                </div>
            </div>

            {currentChar && (
                <div className={`kana-display ${isCorrect === true ? "flash-correct" : isCorrect === false ? "flash-wrong" : ""}`}>
                    {currentChar.kana}
                </div>
            )}

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
