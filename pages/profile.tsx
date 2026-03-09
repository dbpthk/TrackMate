import { useState } from "react";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProfileForm, type ProfileFormValues } from "@/components/ProfileForm";
import { ProfileView } from "@/components/ProfileView";
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
        experienceLevel: user.experienceLevel ?? "",
        age: user.age != null ? String(user.age) : "",
        height: user.height != null ? String(user.height) : "",
        weight: user.weight != null ? String(user.weight) : "",
        bodyFat: user.bodyFat != null ? String(user.bodyFat) : "",
        trainingSplit: user.trainingSplit ?? "",
        preferredDays: user.preferredDays ?? "",
        units: user.units ?? "metric",
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
    experienceLevel: string;
    age: string;
    height: string;
    weight: string;
    bodyFat: string;
    trainingSplit: string;
    preferredDays: string;
    units: string;
  };
};

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: ProfileFormValues) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Update failed");
  };

  const handleSuccess = () => {
    setIsEditing(false);
    router.push("/dashboard");
  };

  const initialValues = {
    name: user.name,
    email: user.email,
    goal: user.goal,
    experienceLevel: user.experienceLevel,
    age: user.age,
    height: user.height,
    weight: user.weight,
    bodyFat: user.bodyFat,
    trainingSplit: user.trainingSplit,
    preferredDays: user.preferredDays,
    units: user.units,
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
            <div className="flex items-center gap-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Edit profile
                </button>
              )}
              <Link
                href="/"
                className="text-sm font-medium text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Home
              </Link>
            </div>
          </div>

          {isEditing ? (
            <ProfileForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              onSuccess={handleSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileView user={initialValues} />
          )}

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
