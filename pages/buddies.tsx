import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { BuddyList, type Buddy } from "@/components/BuddyList";
import {
  BuddyWorkoutFeed,
  type BuddyWorkout,
} from "@/components/BuddyWorkoutFeed";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};

export default function BuddiesPage() {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [feed, setFeed] = useState<BuddyWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuddies = async () => {
    const res = await fetch("/api/buddies");
    if (res.ok) {
      const data = await res.json();
      setBuddies(data);
    }
  };

  const fetchFeed = async () => {
    const res = await fetch("/api/buddies/feed");
    if (res.ok) {
      const data = await res.json();
      setFeed(data);
    }
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([fetchBuddies(), fetchFeed()]);
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
      throw new Error(data.error ?? "Failed to add");
    }
    await load();
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
              <BuddyList
                buddies={buddies}
                onUnfollow={handleUnfollow}
                onFollow={handleFollow}
              />
              <BuddyWorkoutFeed workouts={feed} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
