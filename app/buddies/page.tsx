import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  getBuddiesWithUsers,
  getPendingRequestsForUser,
  getPendingRequestsSentByUser,
  getAcceptedRequestsSentByUser,
  getNotificationViewedRecipientIds,
  getSharedPersonalRecordsReceived,
  getSharedPersonalRecordsSent,
  getUsersWhoFollowYou,
} from "@/lib/db/queries";
import { BuddiesPageClient } from "./BuddiesPageClient";

export const metadata = {
  title: "Buddies | TrackMate",
};

const buddiesCacheTag = (userId: number) => `buddies-${userId}`;

async function getBuddiesData(userId: number) {
  return unstable_cache(
    async () => {
      const [
        buddies,
        followRequests,
        sentFollowRequests,
        acceptedSentRequests,
        notificationViewedIds,
        followers,
        sharedPRs,
        sharedSent,
      ] = await Promise.all([
        getBuddiesWithUsers(userId),
        getPendingRequestsForUser(userId),
        getPendingRequestsSentByUser(userId),
        getAcceptedRequestsSentByUser(userId),
        getNotificationViewedRecipientIds(userId),
        getUsersWhoFollowYou(userId),
        getSharedPersonalRecordsReceived(userId, 20),
        getSharedPersonalRecordsSent(userId, 20),
      ]);
      return {
        buddies,
        followRequests,
        sentFollowRequests,
        acceptedSentRequests,
        notificationViewedIds,
        followers,
        sharedPRs,
        sharedSent,
      };
    },
    [`buddies-${userId}`],
    { revalidate: 60, tags: [buddiesCacheTag(userId)] }
  )();
}

export default async function BuddiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  const userId = Number(session.user.id);

  const {
    buddies,
    followRequests,
    sentFollowRequests,
    acceptedSentRequests,
    notificationViewedIds,
    followers,
    sharedPRs,
    sharedSent,
  } = await getBuddiesData(userId);

  const sharedPRsForClient = sharedPRs.map((s) => ({
    ...s,
    sharedAt:
      s.sharedAt instanceof Date
        ? s.sharedAt.toISOString()
        : String(s.sharedAt),
  }));

  const followRequestsForClient = followRequests.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  const sentForClient = sentFollowRequests.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  const acceptedSentForClient = acceptedSentRequests.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  const sharedSentForClient = sharedSent.map((s) => ({
    ...s,
    sharedAt:
      s.sharedAt instanceof Date ? s.sharedAt.toISOString() : String(s.sharedAt),
  }));

  return (
    <BuddiesPageClient
      initialBuddies={buddies}
      initialFollowRequests={followRequestsForClient}
      initialSentFollowRequests={sentForClient}
      initialAcceptedSentRequests={acceptedSentForClient}
      initialNotificationViewedRecipientIds={notificationViewedIds}
      initialFollowers={followers}
      initialSharedPRs={sharedPRsForClient}
      initialSharedSent={sharedSentForClient}
    />
  );
}
