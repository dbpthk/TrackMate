import { useState } from "react";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProfileForm, type ProfileFormValues } from "@/components/ProfileForm";
import { ProfileView } from "@/components/ProfileView";
import { getUserById } from "@/lib/db/queries";
import { normalizeProfileSplit } from "@/lib/workout-split-map";

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
    router.push("/");
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
    trainingSplit: normalizeProfileSplit(user.trainingSplit) ?? user.trainingSplit,
    preferredDays: user.preferredDays,
    units: user.units,
  };

  return (
    <>
      <Head>
        <title>Profile | TrackMate</title>
      </Head>
      <main
        className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:max-w-2xl lg:mx-auto lg:px-0"
        role="main"
        aria-label="Profile page"
      >
        <div className="space-y-6 sm:space-y-8">
          {/* Header - stacks on mobile, inline on tablet+ */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl md:text-3xl">
              Your profile
            </h1>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit your profile"
                className="inline-flex min-h-[2.75rem] w-fit items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] sm:text-base"
              >
                Edit profile
              </button>
            )}
          </header>

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

          <p className="pt-4 border-t border-border">
            <Link
              href="/api/auth/signout"
              className="text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/60 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Sign out
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
