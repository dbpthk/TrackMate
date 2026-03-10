"use client";

import { useState } from "react";
import { mutate } from "swr";
import { BuddyList, type Buddy } from "@/components/BuddyList";
import {
  FollowRequestsSection,
  type FollowRequest,
} from "@/components/FollowRequestsSection";
import {
  SentFollowRequestsSection,
  type SentFollowRequest,
} from "@/components/SentFollowRequestsSection";
import {
  FollowersSection,
  type Follower,
} from "@/components/FollowersSection";
import {
  SharedPersonalRecordsFeed,
  type SharedPR,
} from "@/components/SharedPersonalRecordsFeed";
import {
  SharedPersonalRecordsSentSection,
  type SharedPRSent,
} from "@/components/SharedPersonalRecordsSentSection";

type BuddiesPageClientProps = {
  initialBuddies: Buddy[];
  initialFollowRequests: FollowRequest[];
  initialSentFollowRequests: SentFollowRequest[];
  initialFollowers: Follower[];
  initialSharedPRs: SharedPR[];
  initialSharedSent: SharedPRSent[];
};

export function BuddiesPageClient({
  initialBuddies,
  initialFollowRequests,
  initialSentFollowRequests,
  initialFollowers,
  initialSharedPRs,
  initialSharedSent,
}: BuddiesPageClientProps) {
  const [buddies, setBuddies] = useState<Buddy[]>(initialBuddies);
  const [followRequests, setFollowRequests] =
    useState<FollowRequest[]>(initialFollowRequests);
  const [sentFollowRequests, setSentFollowRequests] =
    useState<SentFollowRequest[]>(initialSentFollowRequests);
  const [followers, setFollowers] = useState<Follower[]>(initialFollowers);
  const [sharedPRs, setSharedPRs] = useState<SharedPR[]>(initialSharedPRs);
  const [sharedSent, setSharedSent] = useState<SharedPRSent[]>(initialSharedSent);
  const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);

  const load = async () => {
    const [
      buddiesRes,
      requestsRes,
      sentRes,
      followersRes,
      prsRes,
      sharedSentRes,
    ] = await Promise.all([
      fetch("/api/buddies"),
      fetch("/api/buddies/requests"),
      fetch("/api/buddies/requests/sent"),
      fetch("/api/buddies/followers"),
      fetch("/api/share/personal-records"),
      fetch("/api/share/personal-records/sent"),
    ]);
    if (buddiesRes.ok) setBuddies(await buddiesRes.json());
    if (requestsRes.ok) {
      const data = await requestsRes.json();
      setFollowRequests(Array.isArray(data) ? data : []);
    }
    if (sentRes.ok) {
      const data = await sentRes.json();
      setSentFollowRequests(Array.isArray(data) ? data : []);
    }
    if (followersRes.ok) {
      const data = await followersRes.json();
      setFollowers(Array.isArray(data) ? data : []);
    }
    if (prsRes.ok) {
      const data = await prsRes.json();
      setSharedPRs(Array.isArray(data) ? data : []);
    }
    if (sharedSentRes.ok) {
      const data = await sharedSentRes.json();
      setSharedSent(Array.isArray(data) ? data : []);
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
      if (res.ok) {
        mutate(
          "/api/buddies/requests",
          (current: unknown) => {
            const arr = Array.isArray(current) ? current : [];
            return arr.filter((r: { id?: number }) => r.id !== id);
          },
          { revalidate: true }
        );
        await load();
      }
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
      if (res.ok) {
        mutate(
          "/api/buddies/requests",
          (current: unknown) => {
            const arr = Array.isArray(current) ? current : [];
            return arr.filter((r: { id?: number }) => r.id !== id);
          },
          { revalidate: true }
        );
        await load();
      }
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleCancelSentRequest = async (id: number) => {
    setLoadingRequestId(id);
    try {
      const res = await fetch(`/api/buddies/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (res.ok) await load();
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleFollowBack = async (userId: number) => {
    setLoadingRequestId(userId);
    try {
      const res = await fetch("/api/buddies/follow-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
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

  const handleDeleteShared = async (id: number) => {
    setSharedSent((prev) => prev.filter((s) => s.id !== id));
    setLoadingRequestId(id);
    try {
      const res = await fetch(`/api/share/personal-records/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) await load();
    } finally {
      setLoadingRequestId(null);
    }
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
            <SentFollowRequestsSection
              requests={sentFollowRequests}
              onCancel={handleCancelSentRequest}
              loadingId={loadingRequestId}
            />
            <FollowersSection
              followers={followers}
              onFollowBack={handleFollowBack}
              loadingId={loadingRequestId}
            />
            <BuddyList
              buddies={buddies}
              onUnfollow={handleUnfollow}
              onFollow={handleFollow}
            />
            <SharedPersonalRecordsSentSection
              shared={sharedSent}
              onDelete={handleDeleteShared}
              loadingId={loadingRequestId}
            />
            <SharedPersonalRecordsFeed shared={sharedPRs} />
          </div>
      </div>
    </main>
  );
}
