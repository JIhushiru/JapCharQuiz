import {
    ref,
    set,
    get,
    update,
    onValue,
    onDisconnect,
    type Unsubscribe,
} from "firebase/database";
import { db } from "../firebase";
import { generateSequence, type KanaChar } from "./generateSequence";

export interface PlayerData {
    joined: boolean;
    score: number;
    currentIndex: number;
    streak: number;
    maxStreak: number;
    totalAttempts: number;
    connected: boolean;
}

export interface RoomData {
    charset: string;
    characters: KanaChar[];
    createdAt: number;
    status: "waiting" | "playing" | "ended";
    startTime: number | null;
    player1: PlayerData;
    player2: PlayerData | null;
}

function generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function newPlayerData(): PlayerData {
    return {
        joined: true,
        score: 0,
        currentIndex: 0,
        streak: 0,
        maxStreak: 0,
        totalAttempts: 0,
        connected: true,
    };
}

export async function createRoom(charset: string): Promise<string> {
    const code = generateRoomCode();
    const roomRef = ref(db, `rooms/${code}`);

    const characters = generateSequence(charset);

    const roomData: RoomData = {
        charset,
        characters,
        createdAt: Date.now(),
        status: "waiting",
        startTime: null,
        player1: newPlayerData(),
        player2: null,
    };

    await set(roomRef, roomData);

    // Set up disconnect handler for player1
    const p1ConnRef = ref(db, `rooms/${code}/player1/connected`);
    onDisconnect(p1ConnRef).set(false);

    return code;
}

export async function joinRoom(code: string): Promise<void> {
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        throw new Error("Room not found");
    }

    const room = snapshot.val() as RoomData;

    // Reject stale rooms (older than 30 minutes)
    if (Date.now() - room.createdAt > 30 * 60 * 1000) {
        throw new Error("Room has expired");
    }

    if (room.player2) {
        throw new Error("Room is full");
    }

    if (room.status !== "waiting") {
        throw new Error("Game already in progress");
    }

    // Join as player2 and start the game
    const startTime = Date.now();
    await update(roomRef, {
        player2: newPlayerData(),
        status: "playing",
        startTime,
    });

    // Set up disconnect handler for player2
    const p2ConnRef = ref(db, `rooms/${code}/player2/connected`);
    onDisconnect(p2ConnRef).set(false);
}

export function subscribeToRoom(
    code: string,
    callback: (room: RoomData | null) => void
): Unsubscribe {
    const roomRef = ref(db, `rooms/${code}`);
    return onValue(roomRef, (snapshot) => {
        callback(snapshot.exists() ? (snapshot.val() as RoomData) : null);
    });
}

export async function updatePlayerScore(
    code: string,
    player: "player1" | "player2",
    data: Partial<PlayerData>
): Promise<void> {
    const playerRef = ref(db, `rooms/${code}/${player}`);
    await update(playerRef, data);
}

export async function endGame(code: string): Promise<void> {
    const roomRef = ref(db, `rooms/${code}`);
    await update(roomRef, { status: "ended" });
}

export function setupDisconnectHandler(
    code: string,
    player: "player1" | "player2"
): void {
    const connRef = ref(db, `rooms/${code}/${player}/connected`);
    onDisconnect(connRef).set(false);
}

export async function reconnectPlayer(
    code: string,
    player: "player1" | "player2"
): Promise<void> {
    const connRef = ref(db, `rooms/${code}/${player}/connected`);
    await set(connRef, true);
    onDisconnect(connRef).set(false);
}
