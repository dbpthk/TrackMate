"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";

export type SharedPRSent = {
  id: number;
  recipientId: number;
  recipientName: string;
  sharedAt: string;
  records: Array<{
    exerciseName: string;
    weight: number;
    reps: number | null;
    date: string;
  }>;
};

type SharedPersonalRecordsSentSectionProps = {
  shared: SharedPRSent[];
  onDelete: (id: number) => Promise<void>;
  loadingId: number | null;
};

function formatDate(d: string | number | Date | null | undefined) {
  if (d == null) return "";
  const date = typeof d === "string"
    ? d.includes("T")
      ? new Date(d)
      : new Date(d + "T12:00:00")
    : new Date(d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SharedPersonalRecordsSentSection({
  shared,
  onDelete,
  loadingId,
}: SharedPersonalRecordsSentSectionProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open) {
      setDeleteId(null);
      setDeleteError(null);
    }
  };

  if (shared.length === 0) return null;

  return (
    <section aria-labelledby="shared-sent-heading">
      <h2 id="shared-sent-heading" className="mb-4 text-lg font-semibold text-foreground">
        What you shared
      </h2>
      <ul className="space-y-4" role="list" aria-label="Personal records you shared with buddies">
        {shared.map((s) => (
          <li key={s.id}>
            <Card as="article" aria-label={`Shared with ${s.recipientName}`}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle as="h3">Shared with {s.recipientName}</CardTitle>
                    <time
                      dateTime={s.sharedAt}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDate(s.sharedAt)}
                    </time>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(s.id)}
                    disabled={loadingId === s.id}
                    aria-label={`Delete share to ${s.recipientName}`}
                  >
                    {loadingId === s.id ? "…" : "Delete"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {s.records.map((pr, i) => (
                    <li
                      key={`${pr.exerciseName}-${pr.weight}-${i}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-foreground">{pr.exerciseName}</span>
                      <span className="font-medium text-primary">
                        {pr.weight} kg
                        {pr.reps != null ? ` × ${pr.reps}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <Dialog open={deleteId != null} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="max-w-sm" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete?</DialogTitle>
          </DialogHeader>
          {deleteError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            >
              {deleteError}
            </p>
          )}
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCloseDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
              aria-busy={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
