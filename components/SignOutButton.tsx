"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {children ?? "Sign out"}
      </button>
      <Dialog
        open={showConfirm}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="max-w-sm" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Are you sure you want to sign out?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
