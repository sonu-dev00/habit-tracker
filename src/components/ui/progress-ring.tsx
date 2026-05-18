"use client";

import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = "#60a5fa",
  label,
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const [displayValue, setDisplayValue] = useState(0);
  const count = useMotionValue(0);

  useEffect(() => {
    const controls = animate(count, clampedProgress, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [clampedProgress, count]);

  const strokeDashoffset = useTransform(
    count,
    (v) => circumference - (v / 100) * circumference
  );

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-100">
            {displayValue}
            <span className="text-[10px] text-gray-400">%</span>
          </span>
        </div>
      )}
      {label && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
