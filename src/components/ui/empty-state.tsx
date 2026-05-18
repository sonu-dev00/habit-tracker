import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const ActionButton = (
    <Button variant="primary" size="md" onClick={action?.onClick}>
      {action?.label}
    </Button>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-400">{description}</p>
      )}
      {action && <div className="mt-6">{ActionButton}</div>}
    </div>
  );
}
