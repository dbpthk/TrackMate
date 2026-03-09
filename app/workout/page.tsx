import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { WorkoutPageClient } from "./WorkoutPageClient";

export const metadata = {
  title: "Workout Split | TrackMate",
};

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  return <WorkoutPageClient />;
}
