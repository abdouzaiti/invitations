import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GAME_CONFIG } from "../game/config";
import { GAME_AUDIO } from "../game/audio";
import { Calendar, Clock, MapPin, Heart, Sparkles, RefreshCw, Volume2, VolumeX } from "lucide-react";

interface EndingCinematicProps {
  onRestart: () => void;
}

export const EndingCinematic: React.FC<EndingCinematicProps> = ({ onRestart }) => {
  const [phase, setPhase] = useState<"quest_complete" | "final_intro" | "proposal" | "more_reasons" | "invitation">("quest_complete");
  const [isMuted, setIsMuted] = useState(GAME_AUDIO.getMuteState());

  useEffect(() => {
    // Stage 1: Play celebratory fanfare
    GAME_AUDIO.playQuestComplete();

    const t1 = setTimeout(() => {
      setPhase("final_intro");
    }, 4000);

    return () => clearTimeout(t1);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = GAME_AUDIO.toggleMute();
    setIsMuted(nextMuted);
    // If we transition to invitation or positive choices, toggle engine appropriately
    if (phase === "invitation" && !nextMuted) {
      GAME_AUDIO.startEngineSound();
    } else {
      GAME_AUDIO.stopEngineSound();
    }
  };

  const selectAccept = () => {
    GAME_AUDIO.playQuestComplete();
    GAME_AUDIO.startEngineSound();
    setPhase("invitation");
  };

  const selectTellMeMore = () => {
    GAME_AUDIO.playClick();
    setPhase("more_reasons");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fce7f3] px-6 text-center select-none font-mono text-slate-800 overflow-y-auto">
      {/* Background sunset ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-orange-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Persistent Audio Indicator at Top Right */}
      <button
        onClick={handleToggleMute}
        className="absolute top-6 right-6 p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border-2 border-slate-600 rounded text-amber-400 cursor-pointer transition-all active:scale-95"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
      </button>

      <AnimatePresence mode="wait">
        {/* Phase 1: QUEST COMPLETE Banner */}
        {phase === "quest_complete" && (
          <motion.div
            key="quest-complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4 px-2"
          >
            <motion.h1
              initial={{ letterSpacing: "0.05em" }}
              animate={{ letterSpacing: "0.15em" }}
              transition={{ duration: 2 }}
              className="text-rose-700 font-extrabold text-2xl sm:text-4xl md:text-5xl uppercase tracking-wider md:tracking-widest border-y-2 border-rose-700 py-3 px-6 md:px-8"
              style={{ textShadow: "0 0 15px rgba(225,29,72,0.2)" }}
            >
              Quest Completed!
            </motion.h1>
            <p className="text-slate-700 text-xs sm:text-sm tracking-widest uppercase font-semibold">
              You found all scattered memories.
            </p>
          </motion.div>
        )}

        {/* Phase 2: BUT THERE IS ONE FINAL QUEST... */}
        {phase === "final_intro" && (
          <motion.div
            key="final-intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-3 max-w-md px-2"
          >
            <p className="text-rose-700 font-extrabold text-xs uppercase tracking-widest">
              A New Quest Unlocks
            </p>
            <h2 className="text-lg md:text-2xl text-slate-800 font-semibold leading-relaxed px-4">
              “ But there is one final quest... ”
            </h2>
            <button
              onClick={() => {
                GAME_AUDIO.playClick();
                setPhase("proposal");
              }}
              className="mt-6 px-6 py-2.5 bg-slate-900 border-2 border-rose-400/50 hover:border-rose-500 rounded text-xs text-rose-200 hover:text-white uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-md"
            >
              Begin
            </button>
          </motion.div>
        )}

        {/* Phase 3: THE PROPOSAL QUESTION */}
        {phase === "proposal" && (
          <motion.div
            key="proposal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center max-w-lg w-full px-2"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-5xl md:text-6xl mb-4 md:mb-6 filter drop-shadow-[0_0_15px_rgba(225,29,72,0.3)]"
            >
              🏍️❤️
            </motion.div>

            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-slate-900 leading-snug px-2 text-center tracking-wide mb-8 md:mb-12">
              “ Wanna go for a ride with me, {GAME_CONFIG.targetName}? ”
            </h1>

            {/* Decision Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full px-2 sm:px-6">
              <button
                onClick={selectAccept}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white font-black text-sm uppercase tracking-widest rounded-xl border-b-4 border-rose-800 shadow-lg active:translate-y-0.5 transition-all cursor-pointer"
              >
                Let's Ride! 🏍️
              </button>

              <button
                onClick={selectTellMeMore}
                className="w-full py-3.5 bg-slate-900/90 hover:bg-slate-800 text-rose-200 hover:text-white font-extrabold text-sm uppercase tracking-widest rounded-xl border-b-4 border-slate-950 active:translate-y-0.5 transition-all cursor-pointer border border-rose-300/30"
              >
                Tell me more 👀
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 4: TELL ME MORE SCREEN */}
        {phase === "more_reasons" && (
          <motion.div
            key="more-reasons"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center max-w-md w-full px-3 font-mono"
          >
            <h3 className="text-rose-700 font-bold text-xs uppercase tracking-widest mb-6">
              The Journey Details
            </h3>

            <div className="flex flex-col gap-3 text-left w-full px-4 text-sm text-slate-800 mb-8 border-l-2 border-rose-400 pl-4 py-1 bg-white/40 backdrop-blur-sm rounded-r-lg shadow-sm">
              <p className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" /> Good music.
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" /> An open, scenic highway.
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" /> A vintage motorcycle.
              </p>
              <p className="flex items-center gap-2 font-bold text-rose-900">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" /> And you.
              </p>
            </div>

            <p className="text-base font-extrabold text-slate-900 mb-6">
              So... let's ride?
            </p>

            <button
              onClick={selectAccept}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white font-black text-sm uppercase tracking-widest rounded-xl border-b-4 border-rose-800 shadow-md active:translate-y-0.5 transition-all cursor-pointer"
            >
              Let's Ride! 🏍️
            </button>
          </motion.div>
        )}

        {/* Phase 5: YES ENDING - THE DATE INVITATION TICKET */}
        {phase === "invitation" && (
          <motion.div
            key="invitation"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md w-full relative z-10"
          >
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-widest mb-4">
              <Heart className="w-4 h-4 fill-rose-600 animate-pulse" /> Final Quest Unlocked
            </div>

            {/* Retro Ticket Design */}
            <div className="bg-[#10192e] text-slate-100 border-4 border-amber-500 rounded-2xl p-4 sm:p-6 w-full shadow-2xl relative overflow-hidden mb-6">
              {/* Ticket edge notch cutouts */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#fce7f3] border-r-4 border-amber-500 transform -translate-y-1/2" />
              <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#fce7f3] border-l-4 border-amber-500 transform -translate-y-1/2" />
              
              <div className="absolute inset-0.5 border-2 border-[#1e293b] rounded-xl pointer-events-none" />

              <div className="text-center border-b border-dashed border-slate-700/80 pb-4 mb-5">
                <h2 className="text-amber-400 font-extrabold text-lg sm:text-xl tracking-widest uppercase font-black">
                  THE RIDE 🏍️
                </h2>
                <span className="text-[9px] text-slate-400 tracking-widest uppercase">
                  Boarding Pass / Invitation Ticket
                </span>
              </div>

              {/* Ticket details */}
              <div className="flex flex-col gap-3.5 text-left px-1 sm:px-2 font-mono">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-slate-400 tracking-wider uppercase font-bold">Date</span>
                    <p className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                      {GAME_CONFIG.dateInfo.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-slate-400 tracking-wider uppercase font-bold">Time</span>
                    <p className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                      {GAME_CONFIG.dateInfo.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-slate-400 tracking-wider uppercase font-bold">Meeting Point</span>
                    <p className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-wide">
                      {GAME_CONFIG.dateInfo.meetingPoint}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-1 text-center">
                  <span className="text-[9px] text-slate-400 tracking-wider uppercase font-bold">Destination?</span>
                  <p className="text-xs sm:text-sm italic font-extrabold text-amber-400 mt-0.5">
                    “ Somewhere worth remembering ”
                  </p>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="mt-5 flex flex-col items-center gap-1 opacity-75">
                <div className="flex justify-center h-6 sm:h-8 gap-[1px]">
                  {[1, 2, 4, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4].map((width, i) => (
                    <div
                      key={i}
                      className="bg-slate-300"
                      style={{ width: `${width}px` }}
                    />
                  ))}
                </div>
                <span className="text-[8px] text-slate-400 tracking-wider font-semibold">
                  Alex & Sarah • see you on the road
                </span>
              </div>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-wider mb-6 flex items-center gap-2">
              See you on the road. <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-rose-600 fill-rose-600 inline" />
            </h2>

            {/* Restart Button */}
            <button
              onClick={() => {
                GAME_AUDIO.playClick();
                GAME_AUDIO.stopEngineSound();
                onRestart();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border-2 border-rose-400/40 rounded-xl text-xs text-rose-200 hover:text-white uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" /> Restart Adventure
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default EndingCinematic;
