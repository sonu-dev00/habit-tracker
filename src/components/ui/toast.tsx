"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
};

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastIdCounter}`;
      const newToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex flex-col-reverse gap-2 p-4 w-full max-w-sm outline-none" />
        {toasts.map((toast) => {
          const type = toast.type ?? "info";
          return (
            <ToastPrimitive.Root
              key={toast.id}
              open
              onOpenChange={(open) => {
                if (!open) removeToast(toast.id);
              }}
              duration={toast.duration ?? 5000}
              className={cn(
                "relative rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl p-4 shadow-2xl",
                "border-l-4",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
                borderColors[type]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
                <div className="flex-1 min-w-0">
                  <ToastPrimitive.Title className="text-sm font-medium text-gray-100">
                    {toast.title}
                  </ToastPrimitive.Title>
                  {toast.description && (
                    <ToastPrimitive.Description className="mt-1 text-xs text-gray-400">
                      {toast.description}
                    </ToastPrimitive.Description>
                  )}
                </div>
                <ToastPrimitive.Close className="flex-shrink-0 rounded-lg p-1 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
                  <X className="h-4 w-4" />
                </ToastPrimitive.Close>
              </div>
            </ToastPrimitive.Root>
          );
        })}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toast = useCallback(
    (params: Omit<Toast, "id">) => {
      ctx.addToast(params);
    },
    [ctx]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      ctx.addToast({ title, description, type: "success" });
    },
    [ctx]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      ctx.addToast({ title, description, type: "error" });
    },
    [ctx]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      ctx.addToast({ title, description, type: "info" });
    },
    [ctx]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      ctx.addToast({ title, description, type: "warning" });
    },
    [ctx]
  );

  return { toast, success, error, info, warning };
}

export function Toaster() {
  return null;
}
