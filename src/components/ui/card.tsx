"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const cardVariants = {
  default: "",
  interactive:
    "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-white/20 hover:shadow-xl",
  glow: "shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 border-blue-500/20",
};

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: keyof typeof cardVariants;
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
          cardVariants[variant],
          glow && "shadow-lg shadow-blue-500/10",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard, cardVariants };
