import { useRef } from "react";
import { motion } from "framer-motion";
import { PiggyBank } from "lucide-react";

export default function PiggyBankComponent() {
  const piggyRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={piggyRef}
      className="relative w-full h-full cursor-pointer"
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.2,
        y: -10,
        transition: { duration: 0.3 },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 },
      }}
    >
      <div className="w-full h-full bg-gradient-to-br from-fintech-accent-green/20 to-fintech-accent-blue/20 rounded-full flex items-center justify-center">
        <PiggyBank className="text-5xl text-fintech-accent-green" size={80} />
      </div>
      
      {/* Coins falling effect */}
      {Array.from({ length: 2 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-fintech-accent-green rounded-full"
          style={{
            left: `${40 + i * 20}%`,
            top: "20%",
          }}
          animate={{
            y: [0, 50, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1.5,
          }}
        />
      ))}
    </motion.div>
  );
}
