"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
  children?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
};

export function SignOutButton({
  className,
  children,
  onOpen,
  onClose,
}: SignOutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = () => {
    setShowConfirm(true);
    onOpen?.();
  };

  const handleClose = () => {
    setShowConfirm(false);
    onClose?.();
  };

  const handleSignOut = () => {
    setShowConfirm(false);
    onClose?.();
    void signOut({ callbackUrl: "/" });
  };

  const popup = showConfirm ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={handleClose}
      />
      <div
        className="relative z-10 mx-auto w-full max-w-sm rounded-lg border border-border bg-surface p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="signout-confirm-title" className="text-foreground">
          Are you sure you want to sign out?
        </p>
        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {children ?? "Sign out"}
      </button>
      {mounted && popup && createPortal(popup, document.body)}
    </>
  );
}
