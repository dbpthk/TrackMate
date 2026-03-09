"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated" && !!session?.user;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to main content
      </a>
      <Navbar />
      <div
        id="main-content"
        tabIndex={-1}
        className={`min-h-[calc(100vh-3.5rem)] ${isSignedIn ? "pb-16 md:pb-0" : ""}`}
      >
        {children}
      </div>
      {isSignedIn && <BottomNav />}
    </>
  );
}
