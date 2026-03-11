"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  "aria-describedby"?: string;
  size?: "default" | "medium" | "large";
  /** Rendered in a fixed footer below scrollable content (always visible on mobile) */
  footer?: React.ReactNode;
};

const sizeClasses = {
  default:
    "top-auto bottom-0 -translate-y-0 max-h-[90dvh] max-w-md rounded-t-xl border-b-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:max-h-[85vh] sm:max-w-lg sm:rounded-lg sm:border",
  medium:
    "min-h-[min(60dvh,400px)] max-h-[90dvh] w-[min(100%-2rem,32rem)] sm:min-h-[min(calc(50vh+50px),410px)] sm:max-h-[min(calc(85vh+50px),92vh)] sm:w-[min(100%-2rem,36rem)]",
  large:
    "top-auto bottom-0 -translate-y-0 max-h-[90dvh] max-w-full rounded-t-xl border-b-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:min-h-[75vh] sm:max-h-[92vh] sm:max-w-2xl sm:rounded-lg sm:border",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  "aria-describedby": describedBy,
  size = "default",
  footer,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={describedBy}
        className={cn(
          "flex flex-col p-0 gap-0",
          sizeClasses[size]
        )}
        showCloseButton={true}
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-border px-4 py-3 pr-14 sm:px-6 sm:pr-14 sm:pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 text-foreground sm:px-6 sm:pt-4",
            size === "medium" && "min-h-[200px]",
            size === "large" && "max-h-[75dvh] sm:max-h-none"
          )}
          style={{
            paddingBottom: footer
              ? undefined
              : "max(2rem, calc(env(safe-area-inset-bottom) + 1rem))",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-border bg-surface px-4 py-3 sm:px-6"
            style={{
              paddingBottom:
                "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
            }}
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
