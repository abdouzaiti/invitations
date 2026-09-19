import React, { useState } from "react";
import { motion } from "motion/react";
import { Memory } from "../game/config";
import { GAME_AUDIO } from "../game/audio";
import { Sparkles, Calendar, X } from "lucide-react";

interface MemoryCardProps {
  memory: Memory;
  onClose: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClose }) => {
  const [imageError, setImageError] = useState(false);

  // Programmatic SVG fallback illustrations for a handcrafted vintage game feel
  const renderFallbackIllustration = (id: string) => {
    const fillStyle = "fill-amber-500/10 stroke-amber-500";
    if (id === "memory01") {
      // First Spark (Coffee / Conversation)
      return (
        <svg className="w-full h-full bg-slate-900" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#1e293b" />
          <circle cx="50" cy="50" r="30" fill="none" className="stroke-amber-500/20" strokeWidth="2" strokeDasharray="4 4" />
          {/* Coffee Mug */}
          <path d="M35 45 H55 V65 C55 70 45 70 45 70 H35 Z" className={fillStyle} strokeWidth="3" />
          <path d="M55 48 H62 C65 48 65 58 62 58 H55" className={fillStyle} strokeWidth="3" fill="none" />
          {/* Steam */}
          <path d="M40 38 Q42 32 40 26" className={fillStyle} strokeWidth="2" fill="none" />
          <path d="M48 38 Q50 32 48 26" className={fillStyle} strokeWidth="2" fill="none" />
          {/* Sparkles */}
          <circle cx="28" cy="30" r="2" fill="#eab308" />
          <circle cx="68" cy="40" r="3" fill="#eab308" />
        </svg>
      );
    }
    if (id === "memory02") {
      // Shared Laughs (Hearts / Fun)
      return (
        <svg className="w-full h-full bg-slate-900" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#1e293b" />
          {/* Nested hearts */}
          <path d="M50 35 C40 20 20 30 50 65 C80 30 60 20 50 35 Z" className="fill-rose-500/20 stroke-rose-400" strokeWidth="3" />
          <path d="M50 43 C45 32 32 38 50 60 C68 38 55 32 50 43 Z" className="fill-rose-500/40 stroke-rose-400" strokeWidth="2" />
          <circle cx="20" cy="20" r="4" fill="#fb7185" />
          <circle cx="80" cy="70" r="3" fill="#fb7185" />
        </svg>
      );
    }
    if (id === "memory03") {
      // Cozy Getaways (Camp / Trees)
      return (
        <svg className="w-full h-full bg-slate-900" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#1e293b" />
          {/* Mountain & Trees */}
          <path d="M15 75 L50 35 L85 75 Z" className={fillStyle} strokeWidth="3" />
          <path d="M40 75 L60 55 L80 75 Z" className="fill-amber-500/5 stroke-amber-500/60" strokeWidth="2" />
          {/* Pine tree */}
          <path d="M30 75 V60 H25 L32 50 L39 60 H34 V75 Z" fill="#10b981" />
          {/* Glowing star */}
          <polygon points="50,15 52,22 59,22 54,26 56,32 50,28 44,32 46,26 41,22 48,22" fill="#fbbf24" />
        </svg>
      );
    }
    // Default Memory04: Quiet Sunset (Sunset Road)
    return (
      <svg className="w-full h-full bg-slate-900" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#1e293b" />
        {/* Sun half-sphere */}
        <path d="M20 70 A 30 30 0 0 1 80 70 Z" className="fill-amber-400/20 stroke-amber-400" strokeWidth="3" />
        <line x1="10" y1="70" x2="90" y2="70" className="stroke-amber-400" strokeWidth="3" />
        {/* Road perspective lines */}
        <line x1="50" y1="70" x2="25" y2="95" className="stroke-slate-500" strokeWidth="2" />
        <line x1="50" y1="70" x2="75" y2="95" className="stroke-slate-500" strokeWidth="2" />
        {/* Sparkles */}
        <circle cx="30" cy="25" r="2" fill="#fbbf24" />
        <circle cx="70" cy="30" r="3" fill="#fbbf24" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none font-mono">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative bg-[#0f172a] text-slate-100 border-4 border-amber-500 rounded p-4 max-w-sm w-full shadow-[0_0_25px_rgba(234,179,8,0.35)]"
      >
        {/* Pixel outline border highlight */}
        <div className="absolute inset-0.5 border-2 border-[#1e293b] rounded pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="font-extrabold tracking-wider text-sm uppercase">Memory Found</h3>
          </div>
          <button
            onClick={() => {
              GAME_AUDIO.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 bg-slate-800 border-2 border-slate-600 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vintage Polaroid Container with High-Contrast border */}
        <div className="bg-slate-50 p-3 rounded shadow-md border-4 border-[#3f3f46] mb-4">
          <div className="aspect-square bg-slate-200 border-2 border-[#3f3f46] rounded overflow-hidden relative">
            {imageError ? (
              renderFallbackIllustration(memory.id)
            ) : (
              <img
                src={memory.image}
                alt={memory.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* Polaroid label */}
          <div className="mt-3 flex items-center justify-between text-[#27272a] font-bold text-xs">
            <span className="uppercase tracking-widest">{memory.title}</span>
            {memory.date && (
              <span className="flex items-center gap-1 opacity-70">
                <Calendar className="w-3.5 h-3.5" />
                {memory.date}
              </span>
            )}
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed text-center px-2 py-1 italic mb-4">
          “ {memory.text} ”
        </p>

        {/* Beautiful Continue button */}
        <button
          onClick={() => {
            GAME_AUDIO.playClick();
            onClose();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#090d16] font-extrabold text-sm uppercase tracking-widest rounded border-b-4 border-amber-800 shadow-md transform hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
        >
          Keep Exploring
        </button>
      </motion.div>
    </div>
  );
};
export default MemoryCard;
