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

    const [myScore, setMyScore] = useState(0);
    const [myIndex, setMyIndex] = useState(0);
    const [myStreak, setMyStreak] = useState(0);
    const [myMaxStreak, setMyMaxStreak] = useState(0);
    const [myAttempts, setMyAttempts] = useState(0);

    useEffect(() => {
        if (code && me) {
            reconnectPlayer(code, me);
        }
    }, [code, me]);

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

    useEffect(() => {
        if (isCorrect !== null) {
            const timer = setTimeout(() => {
                setIsCorrect(null);
                setMessage("");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isCorrect]);

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

    if (phase === "loading") {
        return (
            <div className="flex flex-col items-center gap-3 w-full max-w-140">
                <p className="text-white/50 animate-pulse-slow light:text-black/50">Connecting to game...</p>
            </div>
        );
    }

    if (phase === "ended") {
        const finalMyScore = myData?.score ?? myScore;
        const finalOpScore = opponentData?.score ?? 0;
        const result = finalMyScore > finalOpScore ? "win"
            : finalMyScore < finalOpScore ? "lose" : "draw";

        const resultText = result === "win" ? "You Win!"
            : result === "lose" ? "You Lose!" : "It's a Draw!";

        const resultColor = result === "win" ? "text-success light:text-success-light"
            : result === "lose" ? "text-danger light:text-danger-light"
            : "text-warning light:text-warning-light";

        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-125">
                <h2>Time's Up!</h2>
                <p className={`text-3xl font-bold ${resultColor}`}>{resultText}</p>

                <div className="grid grid-cols-2 gap-6 w-full max-sm:grid-cols-1">
                    <div className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-xl light:bg-black/4">
                        <h3 className="m-0 text-sm text-white/60 uppercase tracking-wide light:text-black/60">You</h3>
                        <span className="text-4xl font-bold text-brand">{finalMyScore}</span>
                        <div className="flex flex-col items-center gap-0.5 text-sm text-white/40 light:text-black/40">
                            <span>Accuracy: {myAccuracy}%</span>
                            <span>Best Streak: {myData?.maxStreak ?? myMaxStreak}</span>
                            <span>Answered: {myData?.totalAttempts ?? myAttempts}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-xl light:bg-black/4">
                        <h3 className="m-0 text-sm text-white/60 uppercase tracking-wide light:text-black/60">Opponent</h3>
                        <span className="text-4xl font-bold text-brand">{finalOpScore}</span>
                        <div className="flex flex-col items-center gap-0.5 text-sm text-white/40 light:text-black/40">
                            <span>Accuracy: {opAccuracy}%</span>
                            <span>Best Streak: {opponentData?.maxStreak ?? 0}</span>
                            <span>Answered: {opponentData?.totalAttempts ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-2">
                    <button className="opacity-60 text-sm hover:opacity-100" onClick={() => navigate("/")}>Back to Menu</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-140">
            <h2>{charsetLabel} — 1v1</h2>

            <div className={`text-4xl font-bold text-brand max-sm:text-3xl ${timeLeft <= 10 ? "animate-pulse-fast" : ""}`}>
                {timeLeft}s
            </div>

            <div className="flex gap-6 w-full justify-center max-sm:gap-3">
                <div className="flex-1 max-w-55 p-4 bg-white/5 rounded-xl flex flex-col items-center gap-1 border-2 border-brand/40 light:bg-black/4 max-sm:p-3">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">You</span>
                    <span className="text-3xl font-bold text-brand max-sm:text-2xl">{myDisplayScore}</span>
                    <span className="text-xs text-white/35 light:text-black/35">Streak: {myStreak}</span>
                </div>
                <div className="flex-1 max-w-55 p-4 bg-white/5 rounded-xl flex flex-col items-center gap-1 border-2 border-transparent light:bg-black/4 max-sm:p-3">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Opponent</span>
                    <span className="text-3xl font-bold text-brand max-sm:text-2xl">{opponentScore}</span>
                    <span className="text-xs text-white/35 light:text-black/35">Streak: {opponentStreak}</span>
                    {!opponentConnected && (
                        <span className="text-xs text-danger font-semibold">Disconnected</span>
                    )}
                </div>
            </div>

            {currentChar && (
                <div className={`text-8xl leading-tight my-4 select-none transition-colors duration-200 max-sm:text-6xl
                    ${isCorrect === true ? "text-success light:text-success-light" : isCorrect === false ? "text-danger light:text-danger-light" : ""}`}>
                    {currentChar.kana}
                </div>
            )}

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
