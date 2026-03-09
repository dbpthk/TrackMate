import { useEffect, useCallback } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  "aria-describedby"?: string;
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  "aria-describedby": describedBy,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={describedBy}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-foreground sm:text-xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}
