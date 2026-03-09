import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import { getUserById } from "@/lib/db/queries";
import { getWorkoutsWithExercisesByUserId } from "@/lib/db/queries";
import { getWeekStartEnd, getTodayDate } from "@/lib/home-utils";
import { HomeDashboard } from "@/components/HomeDashboard";
import { LandingPage } from "@/components/LandingPage";

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
    <main role="main" aria-label="Landing page">
      <LandingPage />
    </main>
  );
}
