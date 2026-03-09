import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const StoreInit = dynamic(() => import("@/components/StoreInit"), {
  ssr: false,
});

const ThemeProvider = dynamic(
  () => import("@/components/ThemeProvider").then((m) => ({ default: m.ThemeProvider })),
  { ssr: false }
);

const AppShell = dynamic(
  () => import("@/components/AppShell").then((m) => ({ default: m.AppShell })),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider>
        <StoreInit />
        <AppShell>
          <Component {...pageProps} />
        </AppShell>
      </ThemeProvider>
    </SessionProvider>
  );
}
