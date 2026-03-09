import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { BuddyList, type Buddy } from "@/components/BuddyList";
import {
  FollowRequestsSection,
  type FollowRequest,
} from "@/components/FollowRequestsSection";
import {
  SharedPersonalRecordsFeed,
  type SharedPR,
} from "@/components/SharedPersonalRecordsFeed";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};

export default function BuddiesPage() {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [sharedPRs, setSharedPRs] = useState<SharedPR[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);

  const fetchBuddies = async () => {
    const res = await fetch("/api/buddies");
    if (res.ok) {
      const data = await res.json();
      setBuddies(data);
    }
  };

  const fetchFollowRequests = async () => {
    const res = await fetch("/api/buddies/requests");
    if (res.ok) {
      const data = await res.json();
      setFollowRequests(Array.isArray(data) ? data : []);
    }
  };

  const fetchSharedPRs = async () => {
    const res = await fetch("/api/share/personal-records");
    if (res.ok) {
      const data = await res.json();
      setSharedPRs(Array.isArray(data) ? data : []);
    }
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([fetchBuddies(), fetchFollowRequests(), fetchSharedPRs()]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

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
    <>
      <Head>
        <title>Buddies | TrackMate</title>
      </Head>
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

          {loading ? (
            <p className="text-muted-foreground" role="status">
              Loading…
            </p>
          ) : (
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
          )}
        </div>
      </main>
    </>
  );
}
