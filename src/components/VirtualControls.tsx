import React from "react";
import { Direction } from "../game/types";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";

interface VirtualControlsProps {
  onDirectionChange: (dir: Direction | null) => void;
  onInteract: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionChange,
  onInteract,
}) => {
  const handleTouchStart = (dir: Direction) => {
    onDirectionChange(dir);
  };

  const handleTouchEnd = () => {
    onDirectionChange(null);
  };

  return (
    <div className="w-full z-30 flex items-center justify-between select-none font-mono px-4 sm:px-8 py-4 bg-[#111c30] border-t-4 border-slate-700/80 rounded-b-lg relative">
      {/* Matte console highlight lines */}
      <div className="absolute inset-0.5 border border-slate-800 rounded-b-lg pointer-events-none" />

      {/* 1. Left Side: Compact Virtual D-Pad */}
      <div className="flex flex-col items-center justify-center bg-[#090d16] p-1.5 rounded-full border-4 border-[#1e293b] shadow-inner relative w-28 h-28 sm:w-32 sm:h-32">
        {/* UP Button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("up"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={(e) => { e.preventDefault(); handleTouchStart("up"); }}
          onMouseUp={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseLeave={handleTouchEnd}
          className="absolute top-1 w-10 h-10 bg-slate-800 active:bg-slate-750 border-2 border-slate-600 rounded-md flex items-center justify-center active:scale-90 transition-all text-amber-400 select-none cursor-pointer shadow"
          style={{ touchAction: "none" }}
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* LEFT Button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("left"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={(e) => { e.preventDefault(); handleTouchStart("left"); }}
          onMouseUp={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseLeave={handleTouchEnd}
          className="absolute left-1 w-10 h-10 bg-slate-800 active:bg-slate-750 border-2 border-slate-600 rounded-md flex items-center justify-center active:scale-90 transition-all text-amber-400 select-none cursor-pointer shadow"
          style={{ touchAction: "none" }}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Center pivot joint */}
        <div className="w-5 h-5 bg-slate-950 rounded-full border-2 border-slate-800" />

        {/* RIGHT Button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("right"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={(e) => { e.preventDefault(); handleTouchStart("right"); }}
          onMouseUp={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseLeave={handleTouchEnd}
          className="absolute right-1 w-10 h-10 bg-slate-800 active:bg-slate-750 border-2 border-slate-600 rounded-md flex items-center justify-center active:scale-90 transition-all text-amber-400 select-none cursor-pointer shadow"
          style={{ touchAction: "none" }}
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* DOWN Button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("down"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseDown={(e) => { e.preventDefault(); handleTouchStart("down"); }}
          onMouseUp={(e) => { e.preventDefault(); handleTouchEnd(); }}
          onMouseLeave={handleTouchEnd}
          className="absolute bottom-1 w-10 h-10 bg-slate-800 active:bg-slate-750 border-2 border-slate-600 rounded-md flex items-center justify-center active:scale-90 transition-all text-amber-400 select-none cursor-pointer shadow"
          style={{ touchAction: "none" }}
        >
          <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Decorative Brand Text & Headphone Jack icon */}
      <div className="hidden sm:flex flex-col items-center opacity-40 text-[9px] tracking-widest text-slate-400 font-bold select-none">
        <span>A & S</span>
        <span>COZY REVERSE-RPG</span>
      </div>

      {/* 2. Right Side: Tactile Action [E] Button */}
      <div className="flex items-center justify-center">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onInteract();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onInteract();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 active:from-emerald-600 active:to-emerald-700 border-4 border-emerald-800 rounded-full flex flex-col items-center justify-center text-[#090d16] shadow-md transform active:scale-90 active:translate-y-0.5 transition-all select-none cursor-pointer"
          style={{ touchAction: "none" }}
        >
          <CornerDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] font-black tracking-widest uppercase mt-1">E</span>
        </button>
      </div>
    </div>
  );
};
export default VirtualControls;
