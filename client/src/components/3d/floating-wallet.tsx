import { useRef } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export default function FloatingWallet() {
  const walletRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={walletRef}
      className="relative w-full h-full cursor-pointer"
      animate={{
        y: [0, -20, 0],
        rotateY: [0, 15, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.1,
        rotateY: 25,
        transition: { duration: 0.3 },
      }}
    >
      <div className="w-full h-full bg-gradient-to-br from-fintech-accent-blue/20 to-fintech-accent-purple/20 rounded-full flex items-center justify-center">
        <Wallet className="text-6xl text-fintech-accent-blue" size={96} />
      </div>
      
      {/* Floating particles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-fintech-accent-blue rounded-full"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
}
