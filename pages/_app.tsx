import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const StoreInit = dynamic(() => import("@/components/StoreInit"), {
  ssr: false,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <StoreInit />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
