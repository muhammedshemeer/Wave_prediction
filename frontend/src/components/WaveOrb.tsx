import { motion } from "framer-motion";

interface WaveOrbProps {
  value: number;
  max?: number;
}

export const WaveOrb = ({ value, max = 10 }: WaveOrbProps) => {
  const fillPercentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="relative w-72 h-72 mx-auto group">
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all duration-700 animate-pulse" />
      
      {/* Circle Container */}
      <div className="relative w-full h-full rounded-full border border-white/20 overflow-hidden glass shadow-2xl flex items-center justify-center">
        {/* Animated Waves */}
        <motion.div 
          className="absolute bottom-0 left-0 w-[200%] h-full flex flex-col justify-end"
          initial={{ y: "100%" }}
          animate={{ y: `${100 - fillPercentage}%` }}
          transition={{ type: "spring", damping: 25, stiffness: 35 }}
        >
          <div className="relative w-full h-full bg-gradient-to-t from-primary/30 to-accent/50">
            <svg viewBox="0 0 100 20" className="absolute -top-[18px] left-0 w-full animate-[wave_4s_linear_infinite] fill-primary/30">
              <path d="M0 10 Q 25 0, 50 10 T 100 10 V 20 H 0 Z" />
              <path d="M100 10 Q 125 0, 150 10 T 200 10 V 20 H 100 Z" />
            </svg>
            <svg viewBox="0 0 100 20" className="absolute -top-[15px] left-0 w-full animate-[wave_6s_linear_infinite_reverse] fill-accent/40 opacity-70">
              <path d="M0 10 Q 25 20, 50 10 T 100 10 V 20 H 0 Z" />
              <path d="M100 10 Q 125 20, 150 10 T 200 10 V 20 H 100 Z" />
            </svg>
          </div>
        </motion.div>
        
        {/* Display Value */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-8xl font-bold font-display text-gradient-cyan drop-shadow-lg">
              {value.toFixed(1)}
            </span>
            <span className="text-sm font-bold tracking-[0.3em] text-primary/80 uppercase mt-[-10px]">
              Meters
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
