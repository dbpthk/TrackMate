import { useEffect, useCallback } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  "aria-describedby"?: string;
  size?: "default" | "large";
  /** Rendered in a fixed footer below scrollable content (always visible on mobile) */
  footer?: React.ReactNode;
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
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const isLarge = size === "large";

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center bg-black/50 backdrop-blur-sm ${
        isLarge ? "items-center p-4" : "items-end p-0 sm:items-center sm:p-4"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={describedBy}
    >
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-xl ${
          isLarge
            ? "max-h-[90vh] max-w-lg sm:min-h-[75vh] sm:max-h-[92vh] sm:max-w-2xl"
            : "max-h-[90dvh] max-w-md rounded-t-xl border-b-0 sm:max-h-[85vh] sm:max-w-lg sm:border"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:pb-4">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-foreground sm:text-xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Close modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div
          className={`min-h-0 flex-1 basis-0 overflow-y-auto overscroll-contain px-4 py-4 text-foreground sm:px-6 sm:pt-4 ${
            isLarge ? "max-h-[60vh] sm:max-h-none" : ""
          }`}
          style={{
            paddingBottom: footer ? undefined : "max(2rem, calc(env(safe-area-inset-bottom) + 1rem))",
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
              paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
