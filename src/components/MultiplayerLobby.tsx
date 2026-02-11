import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createRoom, joinRoom, subscribeToRoom, type RoomData } from "../lib/roomService";
import "../styles/Multiplayer.css";

type LobbyPhase = "choice" | "creating" | "waiting" | "joining";

export default function MultiplayerLobby() {
    const { charset } = useParams<{ charset: string }>();
    const navigate = useNavigate();
    const mode = charset || "hiragana";

    const [phase, setPhase] = useState<LobbyPhase>("choice");
    const [roomCode, setRoomCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState("");

    const charsetLabel = mode === "both" ? "Hiragana & Katakana"
        : mode === "katakana" ? "Katakana" : "Hiragana";

    // Create a room
    const handleCreate = async () => {
        setPhase("creating");
        setError("");
        try {
            const code = await createRoom(mode);
            setRoomCode(code);
            setPhase("waiting");
        } catch {
            setError("Failed to create room. Check your Firebase config.");
            setPhase("choice");
        }
    };

    // Join a room
    const handleJoin = async () => {
        const code = joinCode.trim().toUpperCase();
        if (code.length !== 4) {
            setError("Enter a 4-character room code");
            return;
        }
        setError("");
        try {
            await joinRoom(code);
            navigate(`/multiplayer-game/${code}/player2`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to join room");
        }
    };

    // Subscribe to room when waiting for opponent
    useEffect(() => {
        if (phase !== "waiting" || !roomCode) return;

        const unsub = subscribeToRoom(roomCode, (room: RoomData | null) => {
            if (room && room.status === "playing") {
                navigate(`/multiplayer-game/${roomCode}/player1`);
            }
        });

        return unsub;
    }, [phase, roomCode, navigate]);

    return (
        <div className="lobby-container">
            <h2>{charsetLabel} — 1v1</h2>
            <p className="lobby-subtitle">Play against a friend in real-time</p>

            {phase === "choice" && (
                <div className="lobby-actions">
                    <button className="lobby-btn lobby-btn-primary" onClick={handleCreate}>
                        Create Room
                    </button>
                    <button className="lobby-btn" onClick={() => { setPhase("joining"); setError(""); }}>
                        Join Room
                    </button>
                </div>
            )}

            {phase === "creating" && (
                <p className="waiting-text">Creating room...</p>
            )}

            {phase === "waiting" && (
                <div className="room-code-display">
                    <span className="room-code-label">Room Code</span>
                    <span className="room-code">{roomCode}</span>
                    <p className="waiting-text">Waiting for opponent...</p>
                </div>
            )}

            {phase === "joining" && (
                <div className="join-form">
                    <input
                        value={joinCode}
                        onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                        placeholder="CODE"
                        maxLength={4}
                        autoFocus
                    />
                    <div className="lobby-actions">
                        <button className="lobby-btn lobby-btn-primary" onClick={handleJoin}>
                            Join
                        </button>
                        <button className="lobby-btn" onClick={() => { setPhase("choice"); setError(""); }}>
                            Back
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="lobby-error">{error}</p>}

            <button className="back-btn" onClick={() => navigate("/")}>Back to Menu</button>
        </div>
    );
}
