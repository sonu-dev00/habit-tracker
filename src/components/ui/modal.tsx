"use client";

import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[calc(100vw-2rem)] mx-4",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
                  "rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl p-6 shadow-2xl",
                  sizeClasses[size],
                  className
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    {title && (
                      <Dialog.Title className="text-lg font-semibold text-gray-100">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-gray-400">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-shrink-0 rounded-lg p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
