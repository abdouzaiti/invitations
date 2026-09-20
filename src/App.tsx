import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GameEngine, EngineState } from "./game/engine";
import { GAME_CONFIG, Memory } from "./game/config";
import { GAME_AUDIO } from "./game/audio";
import { DialogueBox } from "./components/DialogueBox";
import { MemoryCard } from "./components/MemoryCard";
import { MemoryJournal } from "./components/MemoryJournal";
import { OpeningCinematic } from "./components/OpeningCinematic";
import { EndingCinematic } from "./components/EndingCinematic";
import { VirtualControls } from "./components/VirtualControls";
import { Sparkles, Volume2, VolumeX, BookOpen, RotateCcw } from "lucide-react";
import { Direction } from "./game/types";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game State synced from Engine
  const [gameState, setGameState] = useState<EngineState | null>(null);

  // Overlay / Layout UI States
  const [hasStarted, setHasStarted] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(GAME_AUDIO.getMuteState());
  const [recentDiscoveredMemory, setRecentDiscoveredMemory] = useState<Memory | null>(null);
  const [previousDiscoveredCount, setPreviousDiscoveredCount] = useState(0);

  // Create & mount the game engine when opening is completed
  useEffect(() => {
    if (!hasStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, (updatedState) => {
      setGameState(updatedState);
    });

    engineRef.current = engine;
    engine.start();

    // Handle high-DPI crisp pixel scaling & responsive mobile bounds
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const container = containerRef.current;
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;

      // Adjust canvas resolution dynamically
      const width = availableWidth;
      const height = availableHeight;

      canvas.width = width;
      canvas.height = height;

      // Set optimal zoom scale for small mobile screens vs desktop
      if (width < 540) {
        engine.setZoomScale(1.05); // Chunky, clear pixel-art for mobile phones
      } else if (width < 800) {
        engine.setZoomScale(0.95);
      } else {
        engine.setZoomScale(0.85); // Cinematic wider view for desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [hasStarted]);

  // Hook into discovered memories array to trigger immediate Polaroid alerts!
  useEffect(() => {
    if (!gameState) return;

    const currentCount = gameState.discoveredMemories.length;
    if (currentCount > previousDiscoveredCount) {
      const newId = gameState.discoveredMemories[currentCount - 1];
      const matchingMemory = GAME_CONFIG.memories.find((m) => m.id === newId);
      if (matchingMemory) {
        setRecentDiscoveredMemory(matchingMemory);
      }
      setPreviousDiscoveredCount(currentCount);
    }
  }, [gameState?.discoveredMemories]);

  // Sound handlers
  const handleToggleMute = () => {
    const nextMuted = GAME_AUDIO.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleRestart = () => {
    GAME_AUDIO.playClick();
    setRecentDiscoveredMemory(null);
    setPreviousDiscoveredCount(0);
    setIsJournalOpen(false);

    if (engineRef.current) {
      engineRef.current.destroy();
    }
    setHasStarted(false);
    setTimeout(() => {
      setHasStarted(true);
    }, 100);
  };

  // Virtual control inputs
  const handleDirectionChange = (dir: Direction | null) => {
    if (engineRef.current) {
      engineRef.current.setMobileDirection(dir);
    }
  };

  const handleVectorChange = (vx: number, vy: number) => {
    if (engineRef.current) {
      engineRef.current.setMobileVector(vx, vy);
    }
  };

  const handleInteract = () => {
    if (engineRef.current) {
      engineRef.current.triggerMobileInteract();
    }
  };

  // Journey Prompt Interaction State
  const [noButtonOffset, setNoButtonOffset] = useState({ x: 0, y: 0 });
  const [noButtonClickCount, setNoButtonClickCount] = useState(0);

  const handleNoClick = () => {
    if (noButtonClickCount === 0) {
      // First attempt: Jump away!
      GAME_AUDIO.playClick();
      setNoButtonOffset({ 
        x: Math.random() > 0.5 ? 150 : -150, 
        y: Math.random() > 0.5 ? -100 : 100 
      });
      setNoButtonClickCount(1);
    } else {
      // Second attempt: "Not working", trigger Yes anyway
      GAME_AUDIO.playQuestComplete();
      engineRef.current?.startEndingJourney();
      // Reset for next time if prompt shows again
      setNoButtonClickCount(0);
      setNoButtonOffset({ x: 0, y: 0 });
    }
  };

  const handleYesClick = () => {
    GAME_AUDIO.playQuestComplete();
    engineRef.current?.startEndingJourney();
    setNoButtonClickCount(0);
    setNoButtonOffset({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#fce7f3] text-slate-800 flex flex-col items-center justify-between select-none overflow-hidden font-mono touch-none">
      {/* Soft romantic ambient background warmth */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_50%,rgba(244,114,182,0.15)] pointer-events-none" />

      <AnimatePresence>
        {/* Step 1: Cinematic Narrative Opening Screen */}
        {!hasStarted && (
          <OpeningCinematic
            key="opening-cinematic-screen"
            onComplete={() => {
              setHasStarted(true);
            }}
          />
        )}

        {/* Step 2: Ending Credits and Personalized Invite Ticket */}
        {gameState?.endingPhase === "credits" && (
          <EndingCinematic
            key="ending-cinematic-screen"
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>

      {/* Main Game Interface */}
      {hasStarted && !gameState?.isGameFinished && (
        <div className="w-full h-full flex flex-col justify-between relative z-10 overflow-hidden bg-[#fce7f3] p-1 sm:p-3">
          
          {/* TOP HUD BAR */}
          <header className="w-full flex items-center justify-between gap-2 px-2 py-1.5 z-20 shrink-0">
            {/* Quest Tracker Pill */}
            {gameState?.activeQuest && (
              <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/50 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-2 max-w-[70%] sm:max-w-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                <div className="flex flex-col truncate">
                  <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider truncate">
                    {gameState.activeQuest.name}
                  </span>
                  <span className="text-[8px] text-slate-300 font-medium truncate">
                    {gameState.activeQuest.id === "find_memories"
                      ? `Memories: ${gameState.discoveredMemories.length}/4`
                      : gameState.activeQuest.description}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions at Top Right */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => {
                  GAME_AUDIO.playClick();
                  setIsJournalOpen(true);
                }}
                className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-md transition-all active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{gameState?.discoveredMemories.length || 0}/4</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-rose-300 border border-rose-300/40 rounded-xl shadow-md transition-all active:scale-95"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </header>

          {/* MAIN GAME CANVAS FRAME */}
          <main
            ref={containerRef}
            className="flex-1 w-full relative rounded-2xl border-4 border-rose-300/60 bg-[#fce7f3] shadow-2xl overflow-hidden my-1 flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              className="block w-full h-full outline-none focus:outline-none bg-[#fce7f3]"
              style={{ imageRendering: "pixelated" }}
            />

            {/* CRT Arcade Scanline subtle texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.08)_50%)] bg-[size:100%_4px] pointer-events-none opacity-30" />

            {/* Ending Choice Prompt Overlay */}
            <AnimatePresence>
              {gameState?.endingPhase === "prompt" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 z-40 flex items-center justify-center p-6"
                >
                  <div className="flex flex-col items-center gap-4 bg-slate-900/90 border-2 border-amber-500/50 p-6 rounded-2xl backdrop-blur-xl shadow-2xl max-w-[280px] w-full text-center">
                    <div className="text-4xl animate-bounce">🏍️</div>
                    <h2 className="text-sm md:text-base font-black text-amber-100 tracking-tight uppercase">
                      Ready to begin the journey?
                    </h2>
                    <div className="flex gap-3 w-full mt-1 relative h-12">
                      <button
                        onClick={handleYesClick}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                      >
                        Yes ❤️
                      </button>
                      <motion.button
                        animate={noButtonOffset}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={handleNoClick}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        {noButtonClickCount === 0 ? "No" : "Wait! 😂"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dialogue Box Overlay */}
            {gameState?.dialogue && (
              <div className={`absolute left-0 right-0 z-40 flex justify-center pointer-events-none ${
                gameState?.endingPhase && gameState.endingPhase.startsWith("scene") 
                  ? "top-4" 
                  : "bottom-4 md:bottom-6"
              }`}>
                <div className="pointer-events-auto">
                  <DialogueBox
                    dialogue={gameState.dialogue}
                    onAdvance={handleInteract}
                  />
                </div>
              </div>
            )}
          </main>

          {/* MOBILE VIRTUAL CONTROLLER & DESKTOP HINTS */}
          <footer className="w-full shrink-0 z-20 pb-safe">
            <VirtualControls
              onDirectionChange={handleDirectionChange}
              onVectorChange={handleVectorChange}
              onInteract={handleInteract}
              onOpenJournal={() => setIsJournalOpen(true)}
              onToggleMute={handleToggleMute}
              isMuted={isMuted}
              discoveredCount={gameState?.discoveredMemories.length || 0}
              totalMemories={4}
              isDialogueOpen={!!gameState?.dialogue}
              onRestart={handleRestart}
            />

            {/* Desktop Keyboard Helper Footer */}
            <div className="hidden md:flex items-center justify-center gap-4 text-slate-600 text-[9px] tracking-wider uppercase text-center pb-1">
              <span>⌨️ Movement: WASD / Arrow Keys</span>
              <span>•</span>
              <span>Interact: SPACE / E / Enter</span>
            </div>
          </footer>
        </div>
      )}

      {/* Dynamic Popups and Modals */}
      <AnimatePresence>
        {/* 1. Newly Unlocked Polaroid Card pop-up */}
        {recentDiscoveredMemory && (
          <MemoryCard
            key={`recent-polaroid-${recentDiscoveredMemory.id}`}
            memory={recentDiscoveredMemory}
            onClose={() => {
              setRecentDiscoveredMemory(null);
            }}
          />
        )}

        {/* 2. Adventure Journal inventory book */}
        {isJournalOpen && gameState && (
          <MemoryJournal
            key="adventure-journal-modal"
            discoveredIds={gameState.discoveredMemories}
            inventoryItems={gameState.inventory}
            onClose={() => {
              setIsJournalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

