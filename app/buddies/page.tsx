import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getBuddiesWithUsers,
  getPendingRequestsForUser,
  getSharedPersonalRecordsReceived,
} from "@/lib/db/queries";
import { BuddiesPageClient } from "./BuddiesPageClient";

export const metadata = {
  title: "Buddies | TrackMate",
};

export default async function BuddiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  const userId = Number(session.user.id);

  const [buddies, followRequests, sharedPRs] = await Promise.all([
    getBuddiesWithUsers(userId),
    getPendingRequestsForUser(userId),
    getSharedPersonalRecordsReceived(userId, 20),
  ]);

  const sharedPRsForClient = sharedPRs.map((s) => ({
    ...s,
    sharedAt:
      s.sharedAt instanceof Date
        ? s.sharedAt.toISOString()
        : String(s.sharedAt),
  }));

  return (
    <BuddiesPageClient
      initialBuddies={buddies}
      initialFollowRequests={followRequests}
      initialSharedPRs={sharedPRsForClient}
    />
  );
}
