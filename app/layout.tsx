import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Providers } from "./providers";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const themeScript = `
(function() {
  var key = 'trackmate-theme';
  try {
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = (stored === 'dark' || stored === 'light') ? stored : (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://trackmate.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TrackMate — Free Workout Tracker",
  description:
    "Track workouts, build splits, hit PRs, and stay consistent. Free fitness tracker for splits, progress, and workout buddies.",
  keywords: [
    "workout tracker",
    "fitness app",
    "workout split",
    "gym log",
    "personal records",
    "free workout app",
  ],
  authors: [{ name: "TrackMate", url: siteUrl }],
  creator: "TrackMate",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TrackMate",
    title: "TrackMate — Free Workout Tracker",
    description:
      "Track workouts, build splits, hit PRs. Free fitness tracker for splits, progress, and workout buddies.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TrackMate — Your Workout Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackMate — Free Workout Tracker",
    description:
      "Track workouts, build splits, hit PRs. Free fitness tracker.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "TrackMate",
              description:
                "Free workout tracker for splits, progress, and workout buddies.",
              url: siteUrl,
              applicationCategory: "HealthApplication",
            }),
          }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
