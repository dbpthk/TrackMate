"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const StoreInit = dynamic(() => import("@/components/StoreInit"), {
  ssr: false,
});

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
    <SessionProvider session={session}>
      <ThemeProvider>
        <StoreInit />
        <AppShell>{children}</AppShell>
      </ThemeProvider>
    </SessionProvider>
  );
}
