/**
 * Home page. Server component; initial data uses server timezone.
 * HomeDashboard fetches client-side when clientToday is set (browser timezone).
 * See docs/TIMEZONE.md for details.
 */
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getUserById,
  getWorkoutsWithExercisesByUserId,
  getHomeCompletions,
  getWorkoutSplitByUserId,
  createOrUpdateWorkoutSplit,
} from "@/lib/db/queries";
import {
  getDayNamesFromProfileSplit,
  getSplitTypeFromProfile,
} from "@/lib/workout-split-map";
import { getWeekStartEnd, getTodayDate } from "@/lib/home-utils";
import { HomeDashboard } from "@/components/HomeDashboard";
import { LandingPage } from "@/components/LandingPage";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      title: "TrackMate — Your Workout Companion",
      description:
        "Track workouts, build splits, hit PRs, and stay consistent. The simple fitness tracker that helps you get stronger.",
    };
  }
  return { title: "TrackMate" };
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <main role="main" aria-label="Landing page">
        <LandingPage />
      </main>
    );
  }

  const userId = Number(session.user.id);
  const user = await getUserById(userId);
  if (!user) {
    return (
      <main role="main" aria-label="Landing page">
        <LandingPage />
      </main>
    );
  }

  const [workouts, completedDates, workoutSplit] = await Promise.all([
    getWorkoutsWithExercisesByUserId(userId),
    (async () => {
      const { start, end } = getWeekStartEnd();
      return getHomeCompletions(userId, start, end);
    })(),
    (async () => {
      const profileSplit = user.trainingSplit ?? null;
      const splitType = getSplitTypeFromProfile(profileSplit);
      const dayNames = getDayNamesFromProfileSplit(profileSplit);
      await createOrUpdateWorkoutSplit(userId, splitType, dayNames);
      return getWorkoutSplitByUserId(userId);
    })(),
  ]);

  const { start, end } = getWeekStartEnd();
  const today = getTodayDate();
  const weekWorkouts = workouts.filter(
    (w) => w.date >= start && w.date <= end
  );
  const todayWorkout = weekWorkouts.find((w) => w.date === today) ?? null;

  const dashboardData = {
    user: {
      name: user.name,
      trainingSplit: user.trainingSplit,
      preferredDays: user.preferredDays,
    },
    weekWorkouts,
    todayWorkout,
    completedDates,
    initialWorkoutSplit: workoutSplit ?? null,
  };

  return <HomeDashboard {...dashboardData} />;
}
