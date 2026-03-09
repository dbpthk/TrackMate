import Link from "next/link";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import { getUserById } from "@/lib/db/queries";
import { getWorkoutsWithExercisesByUserId } from "@/lib/db/queries";
import { getWeekStartEnd, getTodayDate } from "@/lib/home-utils";
import { HomeDashboard } from "@/components/HomeDashboard";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { props: { session: null, dashboardData: null } };
  }

  const userId = Number(session.user.id);
  const user = await getUserById(userId);
  if (!user) {
    return { props: { session, dashboardData: null } };
  }

  const workouts = await getWorkoutsWithExercisesByUserId(userId);
  const { start, end } = getWeekStartEnd();
  const today = getTodayDate();
  const weekWorkouts = workouts.filter(
    (w) => w.date >= start && w.date <= end
  );
  const todayWorkout =
    weekWorkouts.find((w) => w.date === today) ?? null;

  return {
    props: {
      session,
      dashboardData: {
        user: {
          name: user.name,
          trainingSplit: user.trainingSplit,
          preferredDays: user.preferredDays,
        },
        weekWorkouts,
        todayWorkout,
      },
    },
  };
};

type HomeProps = {
  session: { user?: { name?: string } } | null;
  dashboardData: {
    user: { name: string; trainingSplit: string | null; preferredDays: string | null };
    weekWorkouts: Array<{
      id: number;
      userId: number;
      date: string;
      type: string;
      exercises?: Array<{
        id: number;
        name: string;
        sets: number | null;
        reps: number | null;
        weight: number | null;
        duration: number | null;
      }>;
    }>;
    todayWorkout: {
      id: number;
      userId: number;
      date: string;
      type: string;
      exercises?: Array<{
        id: number;
        name: string;
        sets: number | null;
        reps: number | null;
        weight: number | null;
        duration: number | null;
      }>;
    } | null;
  } | null;
};

export default function Home({ session, dashboardData }: HomeProps) {
  const isSignedIn = !!session?.user;

  if (isSignedIn && dashboardData) {
    return <HomeDashboard {...dashboardData} />;
  }

  return (
    <main
      className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12 sm:py-16"
      role="main"
      aria-label="Home page"
    >
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome to TrackMate
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Sign in or create an account to start tracking your fitness journey.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/auth/signin"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
