import React from "react";
import { DialogueState } from "../game/types";
import { GAME_AUDIO } from "../game/audio";

interface DialogueBoxProps {
  dialogue: DialogueState;
  onAdvance: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onAdvance }) => {
  // Render portrait: supports custom image paths/URLs or pixel-art fallbacks
  const renderPortrait = (portrait: string) => {
    // If it's a file path or URL (e.g. from /public folder like "/coach_moh.jpg" or "/npcs/coach.png")
    if (
      portrait.startsWith("/") ||
      portrait.startsWith("http") ||
      portrait.includes(".jpg") ||
      portrait.includes(".png") ||
      portrait.includes(".jpeg") ||
      portrait.includes(".webp") ||
      portrait.includes(".svg")
    ) {
      return (
        <div className="w-20 h-20 rounded overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src={portrait}
            alt="Speaker Portrait"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to default avatar if file not found yet
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      );
    }

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
      className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 w-[calc(100%-20px)] md:w-[480px] max-w-lg z-40 cursor-pointer font-mono select-none"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Classic Nested Pixel Double-Border Panel */}
      <div className="bg-[#0f172a]/95 backdrop-blur-md text-slate-100 border-4 border-amber-500 rounded-xl p-3 md:p-4 shadow-2xl relative">
        <div className="absolute inset-0.5 border-2 border-[#1e293b] rounded-lg pointer-events-none" />

        {/* Header containing Portrait & Name */}
        <div className="flex items-center gap-3 border-b border-slate-700/60 pb-2 mb-2 relative z-10">
          <div className="shrink-0 scale-90 md:scale-100 origin-left">
            {renderPortrait(dialogue.npcPortrait)}
          </div>
          
          <div className="flex flex-col">
            <span className="text-amber-400 font-bold tracking-widest text-[10px] md:text-xs uppercase">
              Speaker
            </span>
            <span className="text-xs md:text-base font-extrabold text-white tracking-wider">
              {dialogue.npcName}
            </span>
          </div>
        </div>

        {/* Text Container */}
        <div className="min-h-[44px] md:min-h-[50px] text-xs md:text-sm text-slate-200 leading-relaxed pl-1 pr-12 relative z-10 font-medium">
          “ {dialogue.typedText} ”
        </div>

        {/* Blinking Skip indicator */}
        {!dialogue.isTyping && (
          <div className="absolute bottom-2.5 right-3 text-amber-400 text-xs animate-pulse flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
            <span className="text-[9px] font-black tracking-wider text-amber-300">TAP / NEXT</span>
            <span className="text-xs leading-none">▼</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default DialogueBox;
