import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom, subscribeToRoom, type RoomData } from "../lib/roomService";

type LobbyPhase = "choice" | "charset" | "creating" | "waiting" | "joining";
type Scope = "basic" | "all";

export default function MultiplayerLobby() {
    const navigate = useNavigate();

    const [phase, setPhase] = useState<LobbyPhase>("choice");
    const [scope, setScope] = useState<Scope>("all");
    const [roomCode, setRoomCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState("");

    const handleCreate = async (charset: string) => {
        const fullCharset = scope === "basic" ? `${charset}-basic` : charset;
        setPhase("creating");
        setError("");
        try {
            const code = await createRoom(fullCharset);
            setRoomCode(code);
            setPhase("waiting");
        } catch {
            setError("Failed to create room. Check your Firebase config.");
            setPhase("choice");
        }
    };

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
        <div className="flex flex-col items-center gap-6 w-full max-w-125">
            <h2>1v1 Mode</h2>
            <p className="text-white/50 text-base light:text-black/50">Play against a friend in real-time</p>

            {phase === "choice" && (
                <div className="flex gap-4 mt-2">
                    <button className="py-4 px-10 text-lg min-w-40 bg-brand text-white hover:bg-brand-hover" onClick={() => { setPhase("charset"); setError(""); }}>
                        Create Room
                    </button>
                    <button className="py-4 px-10 text-lg min-w-40" onClick={() => { setPhase("joining"); setError(""); }}>
                        Join Room
                    </button>
                </div>
            )}

            {phase === "charset" && (
                <div className="flex flex-col items-center gap-4">
                    <h3 className="m-0 text-white/60 light:text-black/60">Character scope</h3>
                    <div className="flex gap-2 justify-center">
                        <button
                            className={`text-sm px-5 py-2 rounded-full transition-all duration-200
                                ${scope === "basic"
                                    ? "bg-brand text-white border-brand"
                                    : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 light:border-black/15 light:bg-black/3 light:text-black/50 light:hover:bg-black/6 light:hover:text-black/70"}`}
                            onClick={() => setScope("basic")}
                        >
                            Basic
                        </button>
                        <button
                            className={`text-sm px-5 py-2 rounded-full transition-all duration-200
                                ${scope === "all"
                                    ? "bg-brand text-white border-brand"
                                    : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 light:border-black/15 light:bg-black/3 light:text-black/50 light:hover:bg-black/6 light:hover:text-black/70"}`}
                            onClick={() => setScope("all")}
                        >
                            All Characters
                        </button>
                    </div>
                    <h3 className="m-0 text-white/60 light:text-black/60">Choose a character set</h3>
                    <div className="flex gap-4 mt-2">
                        <button className="py-4 px-10 text-lg min-w-40" onClick={() => handleCreate("hiragana")}>Hiragana</button>
                        <button className="py-4 px-10 text-lg min-w-40" onClick={() => handleCreate("katakana")}>Katakana</button>
                        <button className="py-4 px-10 text-lg min-w-40" onClick={() => handleCreate("both")}>Both</button>
                    </div>
                    <button
                        className="bg-transparent border-none text-white/40 cursor-pointer text-sm p-0 mt-2 hover:text-white/70 light:text-black/40 light:hover:text-black/70"
                        onClick={() => { setPhase("choice"); setError(""); }}
                    >
                        Back
                    </button>
                </div>
            )}

            {phase === "creating" && (
                <p className="text-white/50 animate-pulse-slow light:text-black/50">Creating room...</p>
            )}

            {phase === "waiting" && (
                <div className="flex flex-col items-center gap-3 p-8 bg-white/5 rounded-xl w-full light:bg-black/4">
                    <span className="text-xs uppercase tracking-wide text-white/40 light:text-black/40">Room Code</span>
                    <span className="text-5xl font-bold tracking-[0.3em] text-brand font-mono">{roomCode}</span>
                    <p className="text-white/50 animate-pulse-slow light:text-black/50">Waiting for opponent...</p>
                </div>
            )}

            {phase === "joining" && (
                <div className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-xl w-full light:bg-black/4">
                    <input
                        value={joinCode}
                        onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                        placeholder="CODE"
                        maxLength={4}
                        className="w-45 text-center text-2xl font-mono tracking-[0.2em] uppercase"
                        autoFocus
                    />
                    <div className="flex gap-4 mt-2">
                        <button className="py-4 px-10 text-lg min-w-40 bg-brand text-white hover:bg-brand-hover" onClick={handleJoin}>
                            Join
                        </button>
                        <button className="py-4 px-10 text-lg min-w-40" onClick={() => { setPhase("choice"); setError(""); }}>
                            Back
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-danger text-sm">{error}</p>}

            <button className="opacity-60 text-sm hover:opacity-100" onClick={() => navigate("/")}>Back to Menu</button>
        </div>
    );
}
