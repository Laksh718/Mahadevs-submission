import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

const AnimatedCard = ({
  children,
  className,
  delay = 0,
  hover = true,
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={
        hover
          ? {
              y: -8,
              scale: 1.03,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "rounded-2xl bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 border-2 border-blue-200/60 backdrop-blur-xl shadow-xl shadow-blue-100/50 transition-all duration-300 relative overflow-hidden",
        className
      )}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/50 via-transparent to-transparent opacity-60 pointer-events-none" />
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
