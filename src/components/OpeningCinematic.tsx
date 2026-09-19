import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GAME_AUDIO } from "../game/audio";

interface OpeningCinematicProps {
  onComplete: () => void;
}

export const OpeningCinematic: React.FC<OpeningCinematicProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const narrative = [
    "Every adventure starts with a destination...",
    "But sometimes...",
    "You don't know where you are going yet.",
  ];

  useEffect(() => {
    if (step < narrative.length) {
      // Typewriter beep on step transition
      GAME_AUDIO.playTypewriter();
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 3200);
      return () => clearTimeout(timer);
    } else if (step === narrative.length) {
      GAME_AUDIO.playQuestComplete();
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleTap = () => {
    GAME_AUDIO.playClick();
    if (step < narrative.length) {
      setStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fce7f3] px-4 md:px-6 text-center select-none font-mono cursor-pointer touch-none"
    >
      <AnimatePresence mode="wait">
        {step < narrative.length && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 max-w-md md:max-w-xl"
          >
            <p
              className="text-base sm:text-xl md:text-2xl text-slate-700 font-medium tracking-wide leading-relaxed px-2"
              style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
            >
              “ {narrative[step]} ”
            </p>
            <span className="text-[10px] md:text-xs tracking-widest uppercase text-rose-600/70 font-semibold animate-pulse">
              Tap anywhere to advance ▶
            </span>
          </motion.div>
        )}
        {step === narrative.length && (
          <motion.div
            key="quest-start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 md:gap-4 px-2"
          >
            <motion.h2
              initial={{ letterSpacing: "0.05em" }}
              animate={{ letterSpacing: "0.2em" }}
              transition={{ duration: 1.2 }}
              className="text-rose-700 font-extrabold text-2xl sm:text-4xl md:text-5xl uppercase tracking-wider md:tracking-widest border-y-2 border-rose-700 py-2.5 md:py-3 px-4 md:px-8"
              style={{
                textShadow: "0 0 10px rgba(225,29,72,0.2)",
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              Quest Started
            </motion.h2>
            <p className="text-slate-600 text-xs sm:text-sm tracking-widest uppercase font-semibold">
              Find the Scattered Memories
            </p>
            <span className="text-[10px] md:text-xs tracking-widest uppercase text-rose-600/70 font-semibold animate-pulse mt-4">
              Tap to enter the world ▶
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default OpeningCinematic;
