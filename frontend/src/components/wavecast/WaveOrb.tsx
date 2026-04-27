import { motion } from "framer-motion";

interface Props {
  value: number | null;
  max?: number;
}

/** Circular gauge with animated wave fill proportional to predicted height. */
export default function WaveOrb({ value, max = 6 }: Props) {
  const pct = value == null ? 0 : Math.min(1, value / max);
  const fillY = 100 - pct * 100; // SVG y where wave surface sits

  return (
    <div className="relative mx-auto size-56 md:size-64">
      <div className="absolute inset-0 rounded-full glass glow-ring" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <defs>
          <clipPath id="orb-clip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(188 95% 55%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(174 80% 35%)" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <g clipPath="url(#orb-clip)">
          <motion.g
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.path
              initial={false}
              animate={{
                d: [
                  `M -20 ${fillY} Q 10 ${fillY - 4} 40 ${fillY} T 100 ${fillY} T 160 ${fillY} V 110 H -20 Z`,
                  `M -20 ${fillY} Q 10 ${fillY + 4} 40 ${fillY} T 100 ${fillY} T 160 ${fillY} V 110 H -20 Z`,
                  `M -20 ${fillY} Q 10 ${fillY - 4} 40 ${fillY} T 100 ${fillY} T 160 ${fillY} V 110 H -20 Z`,
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              fill="url(#wave-grad)"
            />
            <motion.path
              initial={false}
              animate={{
                d: [
                  `M -20 ${fillY + 3} Q 20 ${fillY + 7} 50 ${fillY + 3} T 120 ${fillY + 3} V 110 H -20 Z`,
                  `M -20 ${fillY + 3} Q 20 ${fillY - 1} 50 ${fillY + 3} T 120 ${fillY + 3} V 110 H -20 Z`,
                  `M -20 ${fillY + 3} Q 20 ${fillY + 7} 50 ${fillY + 3} T 120 ${fillY + 3} V 110 H -20 Z`,
                ],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              fill="hsl(174 80% 50%)"
              opacity={0.5}
            />
          </motion.g>
        </g>
        <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(188 95% 55%)" strokeWidth="0.6" opacity="0.7" />
      </svg>
    </div>
  );
}
