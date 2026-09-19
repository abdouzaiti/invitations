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

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16] px-6 text-center select-none font-mono">
      <AnimatePresence mode="wait">
        {step < narrative.length && (
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-lg md:text-2xl text-slate-300 font-medium tracking-wide max-w-xl leading-relaxed"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            “ {narrative[step]} ”
          </motion.p>
        )}

        {step === narrative.length && (
          <motion.div
            key="quest-start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.h2
              initial={{ letterSpacing: "0.1em" }}
              animate={{ letterSpacing: "0.25em" }}
              transition={{ duration: 1.5 }}
              className="text-amber-400 font-extrabold text-3xl md:text-5xl uppercase tracking-widest border-y-2 border-amber-400 py-3 px-8"
              style={{
                textShadow: "0 0 10px rgba(234,179,8,0.5)",
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              Quest Started
            </motion.h2>
            <p className="text-slate-400 text-sm tracking-widest uppercase">
              Find the Scattered Memories
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default OpeningCinematic;
