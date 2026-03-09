import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { getUserById } from "@/lib/db/queries";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  const user = await getUserById(Number(session.user.id));
  if (!user) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return {
    props: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        goal: user.goal ?? "",
        stats:
          typeof user.stats === "object" && user.stats !== null
            ? JSON.stringify(user.stats, null, 2)
            : "{}",
      },
    },
  };
};

type ProfilePageProps = {
  user: {
    id: number;
    name: string;
    email: string;
    goal: string;
    stats: string;
  };
};

export default function ProfilePage({ user }: ProfilePageProps) {
  const handleSubmit = async (values: {
    name: string;
    goal: string;
    stats: string;
  }) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Update failed");
  };

  return (
    <>
      <Head>
        <title>Profile | TrackMate</title>
      </Head>
      <main
        className="min-h-screen bg-background px-4 py-8"
        role="main"
        aria-label="Profile page"
      >
        <div className="mx-auto max-w-xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              Your profile
            </h1>
            <Link
              href="/"
              className="text-sm font-medium text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Home
            </Link>
          </div>
          <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
            Signed in as {user.email}
          </p>
          <ProfileForm
            initialValues={{
              name: user.name,
              goal: user.goal,
              stats: user.stats,
            }}
            onSubmit={handleSubmit}
          />
          <p className="mt-6">
            <Link
              href="/api/auth/signout"
              className="text-sm text-muted-foreground underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Sign out
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
