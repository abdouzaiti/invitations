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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

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

    // Handle initial state loads or overrides from sessionStorage if any
    const engine = new GameEngine(canvas, (updatedState) => {
      setGameState(updatedState);
    });

    engineRef.current = engine;
    engine.start();

    // Resize handler to fit canvas scale perfectly within viewport boundaries with NO scroll
    const handleResize = () => {
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          const maxWidth = Math.min(960, parent.clientWidth);
          const maxHeight = window.innerHeight * 0.85;

          let width = maxWidth;
          let height = width / 1.3;

          // If height overflows viewport heights, scale down proportionally to avoid scroll
          if (height > maxHeight) {
            height = maxHeight;
            width = height * 1.3;
          }

          canvas.width = width;
          canvas.height = height;
        }
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
      // Find the newly added memory
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
    // Reset React storage variables
    setRecentDiscoveredMemory(null);
    setPreviousDiscoveredCount(0);
    setIsJournalOpen(false);

    // Recreate engine cleanly
    if (engineRef.current) {
      engineRef.current.destroy();
    }
    setHasStarted(false);
    // Let the user go back to opening cinematic for maximum atmosphere!
    setTimeout(() => {
      setHasStarted(true);
    }, 100);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#1e3a1e] text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-hidden font-mono touch-none">
      {/* Cozy earthy shadow gradients around the edges */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(15,23,42,0.35)] pointer-events-none" />

      <AnimatePresence>
        {/* Step 1: Cinematic Narrative Opening Screen */}
        {!hasStarted && (
          <OpeningCinematic
            onComplete={() => {
              setHasStarted(true);
            }}
          />
        )}

        {/* Step 2: Ending Cinematic and Personalized Invite Ticket */}
        {gameState?.isGameFinished && (
          <EndingCinematic
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>

      {/* Main Game Interface Board */}
      {hasStarted && !gameState?.isGameFinished && (
        <div className="w-full max-w-4xl flex flex-col items-center relative z-10">

          {/* Interactive Top-down Canvas Game Frame */}
          <div className="w-full bg-slate-950 rounded-lg relative shadow-2xl overflow-hidden aspect-[1.3] border-4 border-slate-900/60">
            <canvas
              ref={canvasRef}
              className="block w-full h-full"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Screen static scanlines overlay for that cozy cathode arcade feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />

            {/* Dynamic Active Quest HUD Panel */}
            {gameState?.activeQuest && (
              <div className="absolute top-4 left-4 z-20 pointer-events-none max-w-[240px]">
                <div className="bg-slate-900/85 backdrop-blur-sm border border-amber-500/40 rounded p-2 shadow-md">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span>Quest</span>
                  </div>
                  <h4 className="text-white text-xs font-black tracking-wide mt-1 uppercase truncate">
                    {gameState.activeQuest.name}
                  </h4>
                  <p className="text-[9px] text-slate-300 leading-normal mt-0.5 font-medium">
                    {gameState.activeQuest.id === "find_memories"
                      ? `Collect glowing polaroids: (${gameState.discoveredMemories.length}/4)`
                      : gameState.activeQuest.description}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom-left classic typewriter Dialogue Panel overlay */}
            {gameState?.dialogue && (
              <DialogueBox
                dialogue={gameState.dialogue}
                onAdvance={() => {
                  if (engineRef.current) {
                    engineRef.current.triggerMobileInteract();
                  }
                }}
              />
            )}
          </div>

          {/* Virtual D-pad Controls Overlay / Handheld Physical Deck */}
          <VirtualControls
            onDirectionChange={(dir) => {
              if (engineRef.current) {
                engineRef.current.setMobileDirection(dir);
              }
            }}
            onInteract={() => {
              if (engineRef.current) {
                engineRef.current.triggerMobileInteract();
              }
            }}
          />

          {/* Interaction Keyboard Guidelines Footer */}
          <div className="mt-3 flex items-center justify-center gap-4 text-slate-500 text-[10px] tracking-wide uppercase text-center">
            <span>💻 MOVE: WASD / Arrows</span>
            <span>•</span>
            <span>INTERACT: SPACE / E / Enter</span>
            <span>•</span>
            <span>📱 MOBILE: D-pad & action button</span>
          </div>
        </div>
      )}



      {/* Dynamic Popups and Modals */}
      <AnimatePresence>
        {/* 1. Newly Unlocked Polaroid Card pop-up */}
        {recentDiscoveredMemory && (
          <MemoryCard
            memory={recentDiscoveredMemory}
            onClose={() => {
              setRecentDiscoveredMemory(null);
            }}
          />
        )}

        {/* 2. Adventure Journal inventory book */}
        {isJournalOpen && gameState && (
          <MemoryJournal
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
