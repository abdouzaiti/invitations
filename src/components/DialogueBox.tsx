import React from "react";
import { DialogueState } from "../game/types";
import { GAME_AUDIO } from "../game/audio";

interface DialogueBoxProps {
  dialogue: DialogueState;
  onAdvance: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onAdvance }) => {
  // Simple programmatically drawn pixel-art portraits to ensure 100% load reliability
  const renderPortrait = (portrait: string) => {
    if (portrait === "guide") {
      return (
        <svg className="w-16 h-16 bg-[#172554] border-2 border-amber-500 rounded p-1" viewBox="0 0 32 32">
          {/* Hood */}
          <path d="M6 10 L26 10 L26 28 L6 28 Z" fill="#1e3a8a" />
          {/* Face */}
          <rect x="10" y="12" width="12" height="10" fill="#ffedd5" />
          {/* Eyes */}
          <rect x="12" y="15" width="2" height="2" fill="#0f172a" />
          <rect x="18" y="15" width="2" height="2" fill="#0f172a" />
          {/* Beard */}
          <path d="M10 20 L22 20 L16 30 Z" fill="#cbd5e1" />
        </svg>
      );
    }
    if (portrait === "traveler") {
      return (
        <svg className="w-16 h-16 bg-[#7c2d12] border-2 border-amber-500 rounded p-1" viewBox="0 0 32 32">
          {/* Hat */}
          <rect x="6" y="8" width="20" height="4" fill="#ca8a04" />
          <rect x="10" y="4" width="12" height="4" fill="#ca8a04" />
          {/* Face */}
          <rect x="10" y="12" width="12" height="10" fill="#ffedd5" />
          {/* Glasses */}
          <rect x="11" y="14" width="4" height="2" fill="#000000" />
          <rect x="17" y="14" width="4" height="2" fill="#000000" />
          <rect x="15" y="15" width="2" height="1" fill="#000000" />
          {/* Scarf */}
          <rect x="8" y="22" width="16" height="4" fill="#b45309" />
        </svg>
      );
    }
    if (portrait === "mechanic") {
      return (
        <svg className="w-16 h-16 bg-[#0369a1] border-2 border-amber-500 rounded p-1" viewBox="0 0 32 32">
          {/* Red Cap */}
          <rect x="8" y="4" width="16" height="6" fill="#dc2626" />
          <rect x="16" y="6" width="12" height="2" fill="#dc2626" /> {/* Cap Visor */}
          {/* Face */}
          <rect x="10" y="10" width="12" height="12" fill="#fed7aa" />
          {/* Eyes */}
          <rect x="12" y="13" width="2" height="2" fill="#1e293b" />
          <rect x="18" y="13" width="2" height="2" fill="#1e293b" />
          {/* Dungaree Straps */}
          <rect x="8" y="22" width="16" height="6" fill="#0284c7" />
        </svg>
      );
    }
    if (portrait === "companion") {
      return (
        <svg className="w-16 h-16 bg-[#111827] border-2 border-amber-500 rounded p-1" viewBox="0 0 32 32">
          {/* Hair back */}
          <rect x="8" y="6" width="16" height="8" fill="#451a03" />
          {/* Face */}
          <rect x="10" y="10" width="12" height="11" fill="#fed7aa" />
          {/* Sideburns */}
          <rect x="8" y="10" width="2" height="5" fill="#451a03" />
          <rect x="22" y="10" width="2" height="5" fill="#451a03" />
          {/* Eyes */}
          <rect x="12" y="12" width="2" height="2" fill="#0f172a" />
          <rect x="18" y="12" width="2" height="2" fill="#0f172a" />
          {/* Jacket */}
          <rect x="6" y="21" width="20" height="7" fill="#15803d" />
          <rect x="15" y="21" width="2" height="7" fill="#cbd5e1" /> {/* Silver Zipper */}
        </svg>
      );
    }

    // Default System/Narrator portrait
    return (
      <div className="w-16 h-16 flex items-center justify-center bg-slate-800 border-2 border-slate-600 text-2xl rounded font-mono">
        ⚙️
      </div>
    );
  };

  return (
    <div
      onClick={() => {
        GAME_AUDIO.playClick();
        onAdvance();
      }}
      className="absolute bottom-4 left-4 right-auto md:right-auto md:w-[480px] w-[calc(100%-32px)] z-40 cursor-pointer font-mono select-none"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Classic Nested Pixel Double-Border Panel */}
      <div className="bg-[#0f172a] text-slate-100 border-4 border-amber-600 rounded p-4 shadow-2xl relative">
        <div className="absolute inset-0.5 border-2 border-[#1e293b] rounded pointer-events-none" />

        {/* Header containing Portrait & Name */}
        <div className="flex items-center gap-4 border-b border-slate-700/60 pb-3 mb-3 relative z-10">
          {renderPortrait(dialogue.npcPortrait)}
          
          <div className="flex flex-col">
            <span className="text-amber-400 font-bold tracking-widest text-xs uppercase">
              Speaker
            </span>
            <span className="text-sm md:text-base font-extrabold text-white tracking-wider">
              {dialogue.npcName}
            </span>
          </div>
        </div>

        {/* Text Container */}
        <div className="min-h-[50px] text-xs md:text-sm text-slate-200 leading-relaxed pl-1 pr-4 relative z-10 font-medium">
          “ {dialogue.typedText} ”
        </div>

        {/* Blinking Skip indicator */}
        {!dialogue.isTyping && (
          <div className="absolute bottom-3 right-4 text-amber-500 text-xs animate-bounce flex items-center gap-1">
            <span className="text-[10px] tracking-wider text-amber-500/70">NEXT</span>
            <span className="text-base leading-none">▼</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default DialogueBox;
