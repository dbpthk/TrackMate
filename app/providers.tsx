"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ThemeProvider = dynamic(
  () =>
    import("@/components/ThemeProvider").then((m) => ({
      default: m.ThemeProvider,
    })),
  { ssr: false }
);

const AppShell = dynamic(
  () =>
    import("@/components/AppShell").then((m) => ({ default: m.AppShell })),
  { ssr: false }
);

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: React.ComponentProps<typeof SessionProvider>["session"];
}) {
  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
