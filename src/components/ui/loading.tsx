import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-[3px]",
  lg: "h-16 w-16 border-[4px]",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-white/10 border-t-blue-500 border-r-purple-500",
        sizeClasses[size],
        className
      )}
    />
  );
}

export interface LoadingScreenProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingScreen({
  fullScreen = true,
  size = "lg",
  label,
  className,
}: LoadingScreenProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <LoadingSpinner size={size} />
      {label && (
        <p className="text-sm text-gray-400 animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      {content}
    </div>
  );
}
