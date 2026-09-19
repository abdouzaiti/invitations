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

const MAX_RADIUS = 36; // Maximum pixel displacement of the handle from center
const DEAD_ZONE = 7;   // Minimum pixel movement to trigger motion

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
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);

  // Position of the joystick handle (poignée) relative to center (in px)
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeDir, setActiveDir] = useState<Direction | null>(null);

  const [isInteracting, setIsInteracting] = useState(false);
  const [isJournalPressed, setIsJournalPressed] = useState(false);

  // Calculate joystick handle displacement & directional vector
  const handlePointerUpdate = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < DEAD_ZONE) {
        setKnobOffset({ x: 0, y: 0 });
        setActiveDir(null);
        onDirectionChange(null);
        if (onVectorChange) onVectorChange(0, 0);
        return;
      }

      // Clamp handle displacement to MAX_RADIUS
      const angle = Math.atan2(deltaY, deltaX);
      const clampedDistance = Math.min(distance, MAX_RADIUS);
      const knobX = Math.cos(angle) * clampedDistance;
      const knobY = Math.sin(angle) * clampedDistance;

      setKnobOffset({ x: knobX, y: knobY });

      // Normalized direction vector (-1 to 1)
      const intensity = clampedDistance / MAX_RADIUS;
      const vx = Math.cos(angle) * intensity;
      const vy = Math.sin(angle) * intensity;

      // Determine primary 4-way direction
      let dir: Direction;
      if (Math.abs(vx) > Math.abs(vy)) {
        dir = vx > 0 ? "right" : "left";
      } else {
        dir = vy > 0 ? "down" : "up";
      }

      setActiveDir(dir);
      onDirectionChange(dir);
      if (onVectorChange) {
        onVectorChange(vx, vy);
      }
    },
    [onDirectionChange, onVectorChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    setIsDragging(true);
    handlePointerUpdate(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    handlePointerUpdate(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      setIsDragging(false);
      setKnobOffset({ x: 0, y: 0 });
      setActiveDir(null);
      onDirectionChange(null);
      if (onVectorChange) onVectorChange(0, 0);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex items-end justify-between px-3 py-2 select-none touch-none pointer-events-auto font-mono">
      {/* LEFT: Ergonomic Analog Joystick Handle (Poignée de commande) */}
      <div className="flex flex-col items-center gap-1">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className={`relative w-36 h-36 rounded-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 transition-colors shadow-[0_10px_25px_rgba(0,0,0,0.45)] backdrop-blur-md flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing ${
            isDragging ? "border-rose-400 ring-2 ring-rose-400/30" : "border-rose-300/40"
          }`}
          style={{ touchAction: "none" }}
          title="Poignée Joystick (Glisser pour diriger)"
        >
          {/* Inner Recessed Track Groove */}
          <div className="absolute inset-2.5 rounded-full bg-slate-950/90 border border-slate-800 shadow-inner pointer-events-none" />

          {/* Directional Crosshair Axes */}
          <div className="absolute w-0.5 h-24 bg-slate-800/80 pointer-events-none" />
          <div className="absolute h-0.5 w-24 bg-slate-800/80 pointer-events-none" />

          {/* Subtle Directional Arrow Markers (Glow when active) */}
          <ArrowUp
            className={`absolute top-2 w-4 h-4 transition-colors pointer-events-none ${
              activeDir === "up" ? "text-rose-400 scale-125" : "text-slate-600/70"
            }`}
          />
          <ArrowDown
            className={`absolute bottom-2 w-4 h-4 transition-colors pointer-events-none ${
              activeDir === "down" ? "text-rose-400 scale-125" : "text-slate-600/70"
            }`}
          />
          <ArrowLeft
            className={`absolute left-2 w-4 h-4 transition-colors pointer-events-none ${
              activeDir === "left" ? "text-rose-400 scale-125" : "text-slate-600/70"
            }`}
          />
          <ArrowRight
            className={`absolute right-2 w-4 h-4 transition-colors pointer-events-none ${
              activeDir === "right" ? "text-rose-400 scale-125" : "text-slate-600/70"
            }`}
          />

          {/* DRAGGABLE ANALOG JOYSTICK HANDLE (POIGNÉE / THUMBSTICK KNOB) */}
          <div
            className="absolute w-16 h-16 rounded-full pointer-events-none flex items-center justify-center"
            style={{
              transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
              transition: isDragging ? "none" : "transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              willChange: "transform",
            }}
          >
            {/* Joystick Knob 3D Shadow */}
            <div className="absolute inset-0 rounded-full bg-black/40 blur-[3px] translate-y-1" />

            {/* Joystick Knob Outer Ring */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-b from-slate-700 via-rose-950 to-slate-900 border-2 border-rose-300/80 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center">
              {/* Inner Grip Ridges */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/80 via-rose-600 to-rose-900 border border-rose-200/50 shadow-inner flex items-center justify-center">
                {/* Center Tactile Dome */}
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-rose-300/60 shadow-md flex items-center justify-center">
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${
                      isDragging ? "bg-rose-400 shadow-[0_0_8px_#f43f5e] scale-125" : "bg-rose-300/60"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
          Joystick
        </span>
      </div>

      {/* CENTER: Utility Buttons (Audio & Restart) */}
      <div className="flex flex-col items-center gap-2 mb-4">
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
