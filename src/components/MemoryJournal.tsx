import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GAME_CONFIG, Memory } from "../game/config";
import { GAME_AUDIO } from "../game/audio";
import { BookOpen, Sparkles, X, MapPin, Key, Compass } from "lucide-react";
import { MemoryCard } from "./MemoryCard";

interface MemoryJournalProps {
  discoveredIds: string[];
  inventoryItems: string[];
  onClose: () => void;
}

export const MemoryJournal: React.FC<MemoryJournalProps> = ({
  discoveredIds,
  inventoryItems,
  onClose,
}) => {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const getMemoryState = (memory: Memory) => {
    return discoveredIds.includes(memory.id);
  };

  const renderMiniIllustration = (id: string) => {
    if (id === "memory01") return "☕";
    if (id === "memory02") return "❤️";
    if (id === "memory03") return "⛺";
    return "🌅";
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none font-mono">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        className="relative bg-[#0b1329] text-slate-100 border-4 border-amber-600 rounded p-4 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Pixel detail border */}
        <div className="absolute inset-0.5 border-2 border-[#1e293b] rounded pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4 relative z-10">
          <div className="flex items-center gap-2 text-amber-400">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-extrabold tracking-widest text-base uppercase">Adventure Journal</h2>
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

        {/* Key Inventory Items segment */}
        <div className="mb-4 relative z-10 bg-[#16223f] p-3 rounded border-2 border-slate-700">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-2 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Key Items
          </h3>
          <div className="flex flex-wrap gap-3">
            {inventoryItems.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No exploration gear found yet. Keep searching...</span>
            ) : (
              inventoryItems.map((item, index) => {
                 const isHelmet = item === "helmet";
                 return (
                   <div
                     key={`inventory-item-${item}-${index}`}
                     className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/80 border border-amber-500/40 rounded text-xs text-amber-200"
                   >
                     <span>{isHelmet ? "🏍️" : "🔑"}</span>
                     <span className="font-bold tracking-wide uppercase">
                       {isHelmet ? "Vintage Helmet" : "Garage Key"}
                     </span>
                   </div>
                 );
               })
            )}
          </div>
        </div>

        {/* Scattered Memories segment */}
        <div className="relative z-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Captured Memories ({discoveredIds.length}/4)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {GAME_CONFIG.memories.map((mem, index) => {
              const isUnlocked = getMemoryState(mem);

              return (
                <div
                  key={`memory-slot-${mem.id}-${index}`}
                  onClick={() => {
                    if (isUnlocked) {
                      GAME_AUDIO.playClick();
                      setSelectedMemory(mem);
                    }
                  }}
                  className={`border-2 p-2.5 rounded flex flex-col justify-between min-h-[140px] relative transition-all ${
                    isUnlocked
                      ? "border-amber-500/60 bg-[#142347] hover:border-amber-500 hover:shadow-[0_0_12px_rgba(234,179,8,0.2)] cursor-pointer"
                      : "border-slate-800 bg-slate-900/50"
                  }`}
                >
                  {/* Miniature polaroid outline */}
                  <div className="flex flex-col items-center justify-center flex-1 py-1">
                    {isUnlocked ? (
                      <>
                        <div className="w-14 h-14 bg-slate-800 border border-slate-600 rounded flex items-center justify-center text-3xl shadow">
                          {renderMiniIllustration(mem.id)}
                        </div>
                        <span className="text-[11px] font-extrabold text-white text-center mt-2.5 uppercase tracking-wider w-full truncate">
                          {mem.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
                          {mem.date}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded flex items-center justify-center text-slate-700 text-2xl">
                          🔒
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 text-center mt-2.5 uppercase tracking-widest">
                          ???
                        </span>
                      </>
                    )}
                  </div>

                  {/* Hint details if locked */}
                  {!isUnlocked && (
                    <div className="mt-2 text-[9px] text-slate-400 leading-tight bg-slate-950/40 p-1.5 rounded flex gap-1 items-start">
                      <Compass className="w-3 h-3 text-amber-500/60 shrink-0 mt-0.5" />
                      <span>{mem.hint}</span>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                      Open
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlocked Single Memory Details Card */}
        <AnimatePresence>
          {selectedMemory && (
            <MemoryCard
              key={`journal-view-card-${selectedMemory.id}`}
              memory={selectedMemory}
              onClose={() => setSelectedMemory(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
export default MemoryJournal;
