"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type PersonalRecord = {
  exerciseName: string;
  weight: number;
  reps: number | null;
  date: string;
};

type Buddy = {
  buddyId: number;
  name: string;
  email: string;
};

type SharePersonalRecordsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  personalRecords: PersonalRecord[];
  onSuccess?: () => void;
};

export function SharePersonalRecordsModal({
  isOpen,
  onClose,
  personalRecords,
  onSuccess,
}: SharePersonalRecordsModalProps) {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSelectedIds(new Set());
      fetch("/api/buddies")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setBuddies(Array.isArray(data) ? data : []))
        .catch(() => setBuddies([]));
    }
  }, [isOpen]);

  const toggleBuddy = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === buddies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(buddies.map((b) => b.buddyId)));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      setError("Select at least one buddy");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/share/personal-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buddyIds: Array.from(selectedIds),
          records: personalRecords,
        }),
      });
      if (!res.ok) {
        let message = "Failed to share";
        try {
          const data = await res.json();
          message = data.error ?? message;
        } catch {
          message = res.status === 404 ? "Share API not found" : `Failed to share (${res.status})`;
        }
        throw new Error(message);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Personal Records">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share your {personalRecords.length} personal record
          {personalRecords.length !== 1 ? "s" : ""} with buddies.
        </p>

        {buddies.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-muted/50 p-4 text-sm text-muted-foreground">
            No buddies yet. Add buddies on the{" "}
            <a href="/buddies" className="text-primary underline">
              Buddies
            </a>{" "}
            page first.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Select buddies
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-primary hover:underline"
              >
                {selectedIds.size === buddies.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-surface-muted/30 p-2">
              {buddies.map((b) => (
                <li key={b.buddyId}>
                  <label className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-surface-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(b.buddyId)}
                      onChange={() => toggleBuddy(b.buddyId)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">{b.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {b.email}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || buddies.length === 0 || selectedIds.size === 0}
            aria-busy={loading}
          >
            {loading ? "Sharing…" : "Share"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
