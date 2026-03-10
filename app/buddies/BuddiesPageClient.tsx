"use client";

import { useState } from "react";
import { BuddyList, type Buddy } from "@/components/BuddyList";
import {
  FollowRequestsSection,
  type FollowRequest,
} from "@/components/FollowRequestsSection";
import {
  SharedPersonalRecordsFeed,
  type SharedPR,
} from "@/components/SharedPersonalRecordsFeed";

type BuddiesPageClientProps = {
  initialBuddies: Buddy[];
  initialFollowRequests: FollowRequest[];
  initialSharedPRs: SharedPR[];
};

export function BuddiesPageClient({
  initialBuddies,
  initialFollowRequests,
  initialSharedPRs,
}: BuddiesPageClientProps) {
  const [buddies, setBuddies] = useState<Buddy[]>(initialBuddies);
  const [followRequests, setFollowRequests] =
    useState<FollowRequest[]>(initialFollowRequests);
  const [sharedPRs, setSharedPRs] = useState<SharedPR[]>(initialSharedPRs);
  const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);

  const load = async () => {
    const [buddiesRes, requestsRes, prsRes] = await Promise.all([
      fetch("/api/buddies"),
      fetch("/api/buddies/requests"),
      fetch("/api/share/personal-records"),
    ]);
    if (buddiesRes.ok) setBuddies(await buddiesRes.json());
    if (requestsRes.ok) {
      const data = await requestsRes.json();
      setFollowRequests(Array.isArray(data) ? data : []);
    }
    if (prsRes.ok) {
      const data = await prsRes.json();
      setSharedPRs(Array.isArray(data) ? data : []);
    }
  };

  const handleFollow = async (email: string) => {
    const res = await fetch("/api/buddies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to send request");
    }
    await load();
  };

  const handleAcceptRequest = async (id: number) => {
    setLoadingRequestId(id);
    try {
      const res = await fetch(`/api/buddies/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      if (res.ok) await load();
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleRejectRequest = async (id: number) => {
    setLoadingRequestId(id);
    try {
      const res = await fetch(`/api/buddies/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (res.ok) await load();
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleUnfollow = async (buddyId: number) => {
    const res = await fetch(`/api/buddies/${buddyId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to unfollow");
    await load();
  };

  return (
    <main
      className="min-h-screen bg-background px-4 py-8"
      role="main"
      aria-label="Buddies page"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Buddies
          </h1>
        </div>

        <div className="space-y-8">
            <FollowRequestsSection
              requests={followRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              loadingId={loadingRequestId}
            />
            <BuddyList
              buddies={buddies}
              onUnfollow={handleUnfollow}
              onFollow={handleFollow}
            />
            <SharedPersonalRecordsFeed shared={sharedPRs} />
          </div>
      </div>
    </main>
  );
}
