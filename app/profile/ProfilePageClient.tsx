"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileForm, type ProfileFormValues } from "@/components/ProfileForm";
import { ProfileView } from "@/components/ProfileView";
import { normalizeProfileSplit } from "@/lib/workout-split-map";

type ProfilePageClientProps = {
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

export function ProfilePageClient({ user }: ProfilePageClientProps) {
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
    <main
      className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:mx-auto lg:max-w-2xl lg:px-0"
      role="main"
      aria-label="Profile page"
    >
      <div className="space-y-6 sm:space-y-8">
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

        <p className="border-t border-border pt-4">
          <Link
            href="/api/auth/signout"
            className="text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/60 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Sign out
          </Link>
        </p>
      </div>
    </main>
  );
}
