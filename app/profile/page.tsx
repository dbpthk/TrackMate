import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getUserById } from "@/lib/db/queries";
import { ProfilePageClient } from "./ProfilePageClient";

export const metadata = {
  title: "Profile | TrackMate",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  const user = await getUserById(Number(session.user.id));
  if (!user) {
    redirect("/auth/signin");
  }

  const userProps = {
    id: user.id,
    name: user.name,
    email: user.email,
    goal: user.goal ?? "",
    experienceLevel: user.experienceLevel ?? "",
    age: user.age != null ? String(user.age) : "",
    height: user.height != null ? String(user.height) : "",
    weight: user.weight != null ? String(user.weight) : "",
    bodyFat: user.bodyFat != null ? String(user.bodyFat) : "",
    trainingSplit: user.trainingSplit ?? "",
    preferredDays: user.preferredDays ?? "",
    units: user.units ?? "metric",
  };

  return <ProfilePageClient user={userProps} />;
}
