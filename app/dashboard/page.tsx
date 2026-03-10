import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getTotalWorkoutsCount,
  getWorkoutStreak,
  getTotalVolume,
  getPersonalRecords,
  getMuscleDistributionFromExercises,
  getStrengthProgress,
  getWorkoutFrequency,
  getRecentWorkouts,
  getVolumeByDate,
  getVolumeByWeek,
} from "@/lib/db/queries";
import { DashboardClient } from "./DashboardClient";

export const metadata = {
  title: "Stats | TrackMate",
};

async function getDashboardData(userId: number) {
  return unstable_cache(
    async () => {
      const [
        totalWorkouts,
        streak,
        totalVolume,
        personalRecords,
        muscleDistribution,
        strengthProgress,
        workoutFrequency,
        recentWorkouts,
        volumeByDate,
        volumeByWeek,
      ] = await Promise.all([
    getTotalWorkoutsCount(userId),
    getWorkoutStreak(userId),
    getTotalVolume(userId),
    getPersonalRecords(userId, 15),
    getMuscleDistributionFromExercises(userId),
    getStrengthProgress(userId, undefined, 30),
    getWorkoutFrequency(userId, 12),
    getRecentWorkouts(userId, 10),
    getVolumeByDate(userId),
    getVolumeByWeek(userId),
  ]);
      return {
        totalWorkouts,
        streak,
        totalVolume,
        personalRecords,
        muscleDistribution,
        strengthProgress,
        workoutFrequency,
        recentWorkouts,
        volumeByDate,
        volumeByWeek,
      };
    },
    [`dashboard-${userId}`],
    { revalidate: 60 }
  )();
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  const userId = Number(session.user.id);

  const {
    totalWorkouts,
    streak,
    totalVolume,
    personalRecords,
    muscleDistribution,
    strengthProgress,
    workoutFrequency,
    recentWorkouts,
    volumeByDate,
    volumeByWeek,
  } = await getDashboardData(userId);

  const props = {
    totalWorkouts,
    streak,
    totalVolume,
    personalRecords,
    muscleDistribution,
    strengthProgress,
    workoutFrequency,
    recentWorkouts: recentWorkouts.map((w) => ({
      id: w.id,
      date: w.date,
      type: w.type,
      exercises: w.exercises,
    })),
    volumeByDate,
    volumeByWeek,
  };

  return <DashboardClient {...props} />;
}
