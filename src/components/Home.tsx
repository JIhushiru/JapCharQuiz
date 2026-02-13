import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CharChart from "./CharChart";

type Mode = "normal" | "timed" | "1v1";
type Scope = "basic" | "all";

export default function Home() {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
    const [scope, setScope] = useState<Scope>("all");
    const [showChart, setShowChart] = useState(false);

    const handleCharset = (charset: string) => {
        const fullCharset = scope === "basic" ? `${charset}-basic` : charset;
        if (selectedMode === "timed") {
            navigate(`/timed-quiz/${fullCharset}`);
        } else {
            navigate(`/quiz/${fullCharset}`);
        }
    };

    return(
        <div className="flex flex-col items-center gap-6">
            <h1>Japanese Character Game</h1>
            <p className="text-white/50 text-lg -mt-2 dark:text-white/50 max-sm:text-base
                          light:text-black/50">
                Test your knowledge of Japanese characters
            </p>

            <div className="mt-8">
                <h2 className="text-xl mb-6 text-white/70 light:text-black/60">Choose a game mode</h2>
                <div className="flex gap-4 justify-center max-sm:flex-col">
                    <button
                        className={`flex flex-col items-center gap-2 py-6 px-8 min-w-45 border-2 rounded-xl cursor-pointer transition-all duration-200
                            ${selectedMode === "normal"
                                ? "border-brand bg-brand/10"
                                : "border-white/15 bg-white/3 hover:border-brand/50 hover:bg-white/6 light:border-black/12 light:bg-black/2 light:hover:border-brand/40 light:hover:bg-black/4"}
                            max-sm:min-w-0 max-sm:w-full`}
                        onClick={() => setSelectedMode("normal")}
                    >
                        <span className="text-lg font-semibold">Normal</span>
                        <span className="text-xs text-white/40 max-w-40 leading-tight light:text-black/40">Practice at your own pace with unlimited time</span>
                    </button>
                    <button
                        className={`flex flex-col items-center gap-2 py-6 px-8 min-w-45 border-2 rounded-xl cursor-pointer transition-all duration-200
                            ${selectedMode === "timed"
                                ? "border-brand bg-brand/10"
                                : "border-white/15 bg-white/3 hover:border-brand/50 hover:bg-white/6 light:border-black/12 light:bg-black/2 light:hover:border-brand/40 light:hover:bg-black/4"}
                            max-sm:min-w-0 max-sm:w-full`}
                        onClick={() => setSelectedMode("timed")}
                    >
                        <span className="text-lg font-semibold">Timed</span>
                        <span className="text-xs text-white/40 max-w-40 leading-tight light:text-black/40">Answer as many as you can in 60 seconds</span>
                    </button>
                    <button
                        className="flex flex-col items-center gap-2 py-6 px-8 min-w-45 border-2 border-white/15 bg-white/3 rounded-xl cursor-pointer transition-all duration-200
                            hover:border-brand/50 hover:bg-white/6
                            light:border-black/12 light:bg-black/2 light:hover:border-brand/40 light:hover:bg-black/4
                            max-sm:min-w-0 max-sm:w-full"
                        onClick={() => navigate("/multiplayer")}
                    >
                        <span className="text-lg font-semibold">1v1</span>
                        <span className="text-xs text-white/40 max-w-40 leading-tight light:text-black/40">Compete against a friend in real-time</span>
                    </button>
                </div>
            </div>

            {selectedMode && (
                <div className="animate-fade-in">
                    <h2 className="text-xl mb-4 text-white/70 light:text-black/60">Character scope</h2>
                    <div className="flex gap-2 justify-center mb-6">
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
                    <p className="text-xs text-white/35 mb-5 light:text-black/30">
                        {scope === "basic"
                            ? "46 basic characters only — no dakuten or combinations"
                            : "All characters including dakuten and combinations"}
                    </p>

                    <h2 className="text-xl mb-6 text-white/70 light:text-black/60">Choose a character set</h2>
                    <div className="flex gap-4 flex-wrap justify-center max-sm:flex-col">
                        <button className="py-4 px-10 text-lg min-w-37.5 max-sm:w-full" onClick={() => handleCharset("hiragana")}>Hiragana</button>
                        <button className="py-4 px-10 text-lg min-w-37.5 max-sm:w-full" onClick={() => handleCharset("katakana")}>Katakana</button>
                        <button className="py-4 px-10 text-lg min-w-37.5 max-sm:w-full" onClick={() => handleCharset("both")}>Both</button>
                    </div>
                </div>
            )}

            <button
                className="mt-10 text-sm text-white/40 border-white/15 bg-white/3
                           hover:text-white/70 hover:border-white/30
                           light:text-black/40 light:border-black/10 light:bg-black/2
                           light:hover:text-black/60 light:hover:border-black/20"
                onClick={() => setShowChart(true)}
            >
                View Character Chart
            </button>

            <p className="mt-4 text-xs text-white/25 light:text-black/25">Type the romaji for each character shown</p>

            <a href="https://jhraportfolio.vercel.app/" target="_blank" rel="noopener noreferrer"
               className="mt-6 text-xs text-white/20 hover:text-white/50 transition-colors light:text-black/20 light:hover:text-black/50">
                Made by JHRA
            </a>

            {showChart && <CharChart onClose={() => setShowChart(false)} />}
        </div>
    );
}
