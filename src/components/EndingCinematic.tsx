import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GAME_AUDIO } from "../game/audio";
import { Heart, Volume2, VolumeX } from "lucide-react";

interface EndingCinematicProps {
  onRestart: () => void;
}

export const EndingCinematic: React.FC<EndingCinematicProps> = ({ onRestart }) => {
  const [isMuted, setIsMuted] = useState(GAME_AUDIO.getMuteState());

  const handleToggleMute = () => {
    const nextMuted = GAME_AUDIO.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 overflow-hidden select-none font-mono text-white backdrop-blur-xl">
      {/* Foreground UI Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6">
        {/* Top Controls */}
        <div className="w-full flex justify-end">
          <button
            onClick={handleToggleMute}
            className="p-3 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-white cursor-pointer transition-all backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Credits Phase */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center p-6 text-center mb-12"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-rose-600 mb-2">
              <Heart className="w-16 h-16 fill-rose-600 animate-pulse" />
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] text-center">
              THE END
            </h1>
            <div className="mt-8 space-y-2">
              <p className="text-rose-400 font-black text-xs md:text-sm tracking-[0.4em] uppercase">
                Developed by Abdou just for you
              </p>
              <p className="text-slate-400 italic text-xs md:text-sm font-medium">
                sema ji bla mzeytek 😂😂
              </p>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              onClick={() => {
                GAME_AUDIO.stopEngineSound();
                onRestart();
              }}
              className="mt-14 px-10 py-3.5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-full hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xl active:scale-95"
            >
              Restart Adventure
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_2px]" />
    </div>
  );
};

export default EndingCinematic;
