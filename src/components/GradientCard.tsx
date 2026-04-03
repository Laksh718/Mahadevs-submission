import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple";
  hover?: boolean;
  glow?: boolean;
}

const GradientCard = ({
  children,
  className,
  variant = "default",
  hover = true,
  glow = false,
}: GradientCardProps) => {
  const { theme } = useTheme();
  const variants = {
    default:
      "bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border-blue-200/60 shadow-blue-100/50",
    primary:
      "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-300/60 shadow-blue-200/50",
    success:
      "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300/60 shadow-green-200/50",
    warning:
      "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-orange-300/60 shadow-orange-200/50",
    danger:
      "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-red-300/60 shadow-red-200/50",
    info:
      "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border-cyan-300/60 shadow-cyan-200/50",
    purple:
      "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-300/60 shadow-purple-200/50",
  };

  const glowStyles = {
    default: "shadow-xl shadow-slate-200/60",
    primary: glow ? "shadow-2xl shadow-blue-300/70" : "shadow-xl shadow-blue-200/60",
    success: glow ? "shadow-2xl shadow-green-300/70" : "shadow-xl shadow-green-200/60",
    warning: glow ? "shadow-2xl shadow-orange-300/70" : "shadow-xl shadow-orange-200/60",
    danger: glow ? "shadow-2xl shadow-red-300/70" : "shadow-xl shadow-red-200/60",
    info: glow ? "shadow-2xl shadow-cyan-300/70" : "shadow-xl shadow-cyan-200/60",
    purple: glow ? "shadow-2xl shadow-purple-300/70" : "shadow-xl shadow-purple-200/60",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 relative overflow-hidden",
        theme === 'high-contrast' ? '' : variants[variant],
        theme === 'high-contrast' ? '' : glowStyles[variant],
        hover && "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] hover:border-opacity-100",
        className
      )}
      style={theme === 'high-contrast' ? {
        backgroundColor: 'hsl(0, 0%, 10%)',
        borderColor: 'hsl(0, 0%, 40%)',
      } : {}}
    >
      {/* Inner glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent opacity-50 pointer-events-none"
        style={theme === 'high-contrast' ? { display: 'none' } : {}}
      />
      {children}
    </div>
  );
};

export default GradientCard;
