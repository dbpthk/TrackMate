import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";

const AnalyticsCharts = dynamic(
  () => import("@/components/AnalyticsCharts").then((m) => ({ default: m.AnalyticsCharts })),
  { ssr: false, loading: () => <p className="text-muted-foreground">Loading charts…</p> }
);
import { ProfileSummary } from "@/components/ProfileSummary";
import {
  getVolumeByDate,
  getVolumeByWeek,
  getWorkoutTypeDistribution,
  getUserById,
} from "@/lib/db/queries";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  const userId = Number(session.user.id);
  const [volumeByDate, volumeByWeek, typeDistribution, user] = await Promise.all([
    getVolumeByDate(userId),
    getVolumeByWeek(userId),
    getWorkoutTypeDistribution(userId),
    getUserById(userId),
  ]);
  return {
    props: {
      volumeByDate,
      volumeByWeek,
      typeDistribution,
      user: user
        ? {
            name: user.name,
            goal: user.goal ?? "",
            experienceLevel: user.experienceLevel ?? "",
            trainingSplit: user.trainingSplit ?? "",
            preferredDays: user.preferredDays ?? "",
            height: user.height,
            weight: user.weight,
            units: user.units ?? "metric",
          }
        : null,
    },
  };
};

type DashboardProps = {
  volumeByDate: { date: string; volume: number }[];
  volumeByWeek: { week: string; volume: number }[];
  typeDistribution: { type: string; count: number }[];
  user: {
    name: string;
    goal: string;
    experienceLevel: string;
    trainingSplit: string;
    preferredDays: string;
    height: number | null;
    weight: number | null;
    units: string;
  } | null;
};

export default function DashboardPage({
  volumeByDate,
  volumeByWeek,
  typeDistribution,
  user,
}: DashboardProps) {
  return (
    <>
      <Head>
        <title>Dashboard | TrackMate</title>
      </Head>
      <main
        className="min-h-screen bg-background px-4 py-8"
        role="main"
        aria-label="Analytics dashboard"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              Analytics
            </h1>
            <nav className="flex gap-3">
              <Link
                href="/"
                className="text-sm text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Home
              </Link>
              <Link
                href="/workouts"
                className="text-sm text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Workouts
              </Link>
              <Link
                href="/profile"
                className="text-sm text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Profile
              </Link>
              <Link
                href="/buddies"
                className="text-sm text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Buddies
              </Link>
            </nav>
          </div>

          {user && (
            <div className="mb-6">
              <ProfileSummary user={user} />
            </div>
          )}

          <AnalyticsCharts
            volumeByDate={volumeByDate}
            volumeByWeek={volumeByWeek}
            typeDistribution={typeDistribution}
          />
        </div>
      </main>
    </>
  );
}
