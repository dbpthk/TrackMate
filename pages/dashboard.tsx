import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import {
  getVolumeByDate,
  getVolumeByWeek,
  getWorkoutTypeDistribution,
} from "@/lib/db/queries";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  const userId = Number(session.user.id);
  const [volumeByDate, volumeByWeek, typeDistribution] = await Promise.all([
    getVolumeByDate(userId),
    getVolumeByWeek(userId),
    getWorkoutTypeDistribution(userId),
  ]);
  return {
    props: {
      volumeByDate,
      volumeByWeek,
      typeDistribution,
    },
  };
};

type DashboardProps = {
  volumeByDate: { date: string; volume: number }[];
  volumeByWeek: { week: string; volume: number }[];
  typeDistribution: { type: string; count: number }[];
};

export default function DashboardPage({
  volumeByDate,
  volumeByWeek,
  typeDistribution,
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
