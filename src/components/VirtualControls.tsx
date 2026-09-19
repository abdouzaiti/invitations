import React, { useRef, useState, useCallback, useEffect } from "react";
import { Direction } from "../game/types";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles, BookOpen, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { GAME_AUDIO } from "../game/audio";

interface VirtualControlsProps {
  onDirectionChange: (dir: Direction | null) => void;
  onVectorChange?: (vx: number, vy: number) => void;
  onInteract: () => void;
  onOpenJournal: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  discoveredCount: number;
  totalMemories: number;
  isDialogueOpen: boolean;
  onRestart: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionChange,
  onVectorChange,
  onInteract,
  onOpenJournal,
  onToggleMute,
  isMuted,
  discoveredCount,
  totalMemories,
  isDialogueOpen,
  onRestart,
}) => {
  const dpadRef = useRef<HTMLDivElement | null>(null);
  const [activeDir, setActiveDir] = useState<Direction | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isJournalPressed, setIsJournalPressed] = useState(false);
  const activePointerId = useRef<number | null>(null);

  // Compute direction from touch coords relative to D-pad center
  const updateDirectionFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!dpadRef.current) return;
      const rect = dpadRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Deadzone check
      if (distance < 12) {
        setActiveDir(null);
        onDirectionChange(null);
        if (onVectorChange) onVectorChange(0, 0);
        return;
      }

      // Normalized vector
      const vx = dx / distance;
      const vy = dy / distance;

      // Determine 4-way direction
      let dir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? "right" : "left";
      } else {
        dir = dy > 0 ? "down" : "up";
      }

      setActiveDir(dir);
      onDirectionChange(dir);
      if (onVectorChange) {
        // Pass directional vector with speed multiplier
        onVectorChange(vx, vy);
      }
    },
    [onDirectionChange, onVectorChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    activePointerId.current = e.pointerId;
    updateDirectionFromPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    updateDirectionFromPoint(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      setActiveDir(null);
      onDirectionChange(null);
      if (onVectorChange) onVectorChange(0, 0);
    }
  };

  // Direct button tap handlers for discrete presses
  const handleButtonDir = (dir: Direction, isDown: boolean) => {
    if (isDown) {
      setActiveDir(dir);
      onDirectionChange(dir);
    } else {
      setActiveDir(null);
      onDirectionChange(null);
      if (onVectorChange) onVectorChange(0, 0);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex items-end justify-between px-3 py-2 select-none touch-none pointer-events-auto font-mono">
      {/* LEFT: 8-Way Ergonomic Retro D-PAD */}
      <div
        ref={dpadRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative w-36 h-36 bg-slate-900/90 border-2 border-rose-300/40 rounded-full p-1 shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md flex items-center justify-center touch-none select-none active:border-rose-400"
        style={{ touchAction: "none" }}
      >
        {/* Subtle cross visual guide */}
        <div className="absolute w-12 h-32 bg-slate-800/80 rounded-lg pointer-events-none" />
        <div className="absolute w-32 h-12 bg-slate-800/80 rounded-lg pointer-events-none" />

        {/* UP BUTTON */}
        <button
          type="button"
          onPointerDown={() => handleButtonDir("up", true)}
          onPointerUp={() => handleButtonDir("up", false)}
          className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-11 h-11 flex items-center justify-center rounded-t-lg transition-all ${
            activeDir === "up"
              ? "bg-rose-500 text-white scale-95 shadow-inner"
              : "bg-slate-700/80 text-rose-200 hover:bg-slate-600/80"
          }`}
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* DOWN BUTTON */}
        <button
          type="button"
          onPointerDown={() => handleButtonDir("down", true)}
          onPointerUp={() => handleButtonDir("down", false)}
          className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-11 h-11 flex items-center justify-center rounded-b-lg transition-all ${
            activeDir === "down"
              ? "bg-rose-500 text-white scale-95 shadow-inner"
              : "bg-slate-700/80 text-rose-200 hover:bg-slate-600/80"
          }`}
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* LEFT BUTTON */}
        <button
          type="button"
          onPointerDown={() => handleButtonDir("left", true)}
          onPointerUp={() => handleButtonDir("left", false)}
          className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-l-lg transition-all ${
            activeDir === "left"
              ? "bg-rose-500 text-white scale-95 shadow-inner"
              : "bg-slate-700/80 text-rose-200 hover:bg-slate-600/80"
          }`}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          type="button"
          onPointerDown={() => handleButtonDir("right", true)}
          onPointerUp={() => handleButtonDir("right", false)}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-r-lg transition-all ${
            activeDir === "right"
              ? "bg-rose-500 text-white scale-95 shadow-inner"
              : "bg-slate-700/80 text-rose-200 hover:bg-slate-600/80"
          }`}
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Pivot Nub */}
        <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-rose-400/40 shadow-inner flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/50" />
        </div>
      </div>

      {/* CENTER: Mini Utility Buttons (Audio & Restart) */}
      <div className="flex flex-col items-center gap-2 mb-1">
        <button
          type="button"
          onClick={() => {
            GAME_AUDIO.playClick();
            onToggleMute();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/85 border border-rose-300/40 text-amber-300 flex items-center justify-center shadow-md active:scale-90 transition-transform"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
        </button>

        <button
          type="button"
          onClick={() => {
            GAME_AUDIO.playClick();
            onRestart();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/85 border border-rose-300/40 text-slate-300 flex items-center justify-center shadow-md active:scale-90 transition-transform"
          title="Restart Game"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* RIGHT: Action & Journal Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Quick Journal Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onPointerDown={() => setIsJournalPressed(true)}
            onPointerUp={() => setIsJournalPressed(false)}
            onClick={() => {
              GAME_AUDIO.playClick();
              onOpenJournal();
            }}
            className={`relative w-12 h-12 rounded-full border-2 border-amber-400/70 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 flex items-center justify-center shadow-lg transition-all active:scale-90 ${
              isJournalPressed ? "scale-90 ring-2 ring-amber-300" : ""
            }`}
          >
            <BookOpen className="w-5 h-5" />
            {/* Memory Count Badge */}
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow">
              {discoveredCount}/{totalMemories}
            </span>
          </button>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700">Journal</span>
        </div>

        {/* Big Action / Interact Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onPointerDown={() => {
              setIsInteracting(true);
              GAME_AUDIO.playClick();
              onInteract();
            }}
            onPointerUp={() => setIsInteracting(false)}
            onPointerCancel={() => setIsInteracting(false)}
            className={`w-20 h-20 rounded-full border-4 border-rose-300 bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(225,29,72,0.4)] transition-all active:scale-90 active:shadow-inner ${
              isInteracting ? "scale-90 ring-4 ring-rose-300" : "animate-pulse"
            }`}
          >
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">
              {isDialogueOpen ? "NEXT" : "ACTION"}
            </span>
          </button>
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-800">
            {isDialogueOpen ? "Advance" : "Interact"}
          </span>
        </div>
      </div>
    </div>
  );
};
