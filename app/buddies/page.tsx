import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { BuddiesPageClient } from "./BuddiesPageClient";

export const metadata = {
  title: "Buddies | TrackMate",
};

export default async function BuddiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  return <BuddiesPageClient />;
}
