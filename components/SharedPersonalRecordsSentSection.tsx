"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId != null) {
      void onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleCancel = () => {
    setDeleteId(null);
  };

  const modal = deleteId != null ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-share-confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={handleCancel}
      />
      <div
        className="relative z-10 mx-auto w-full max-w-sm rounded-lg border border-border bg-surface p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="delete-share-confirm-title" className="text-foreground">
          Are you sure you want to delete?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  ) : null;

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
      {mounted && modal && createPortal(modal, document.body)}
    </section>
  );
}
