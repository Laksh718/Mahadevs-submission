import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated Multi-Layer Gradient Base */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        animate={{
          background: [
            "linear-gradient(to bottom right, rgb(238, 242, 255), rgb(250, 245, 255), rgb(252, 231, 243))",
            "linear-gradient(to bottom right, rgb(224, 242, 254), rgb(238, 242, 255), rgb(254, 249, 195))",
            "linear-gradient(to bottom right, rgb(240, 253, 244), rgb(224, 242, 254), rgb(254, 240, 253))",
            "linear-gradient(to bottom right, rgb(238, 242, 255), rgb(250, 245, 255), rgb(252, 231, 243))",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tl from-cyan-50/50 via-transparent to-blue-50/50"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/30 via-transparent to-transparent"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Enhanced Animated Orbs - More Dynamic */}
      <motion.div
        className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/25 via-cyan-400/20 to-teal-400/25 rounded-full blur-3xl"
        animate={{
          y: [0, -40, 0],
          x: [0, 30, 0],
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-gradient-to-r from-purple-400/25 via-pink-400/20 to-rose-400/25 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -30, 0],
          scale: [1, 1.2, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-emerald-400/20 via-teal-400/25 to-cyan-400/20 rounded-full blur-3xl"
        animate={{
          y: [0, -50, 0],
          x: [0, 40, 0],
          scale: [1, 1.25, 1],
          rotate: [0, 270, 540],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/3 w-[380px] h-[380px] bg-gradient-to-r from-amber-400/15 via-orange-400/20 to-rose-400/15 rounded-full blur-3xl"
        animate={{
          y: [0, 35, 0],
          x: [0, -35, 0],
          scale: [1, 1.18, 1],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-20 w-[420px] h-[420px] bg-gradient-to-r from-indigo-400/20 via-violet-400/25 to-purple-400/20 rounded-full blur-3xl"
        animate={{
          y: [0, -35, 0],
          x: [0, 25, 0],
          scale: [1, 1.12, 1],
          rotate: [0, 360, 720],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Enhanced Grid Pattern with Depth */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      
      {/* Diagonal accent lines */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 80px,
                #8b5cf6 80px,
                #8b5cf6 81px
              )
            `,
          }}
        />
      </div>

      {/* Multi-layer Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/10 to-transparent"
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          delay: 0.5,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
