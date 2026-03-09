"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const navLinksSignedIn = [
  { href: "/", label: "Home" },
  { href: "/workout", label: "Split" },
  { href: "/dashboard", label: "Stats" },
  { href: "/profile", label: "Profile" },
  { href: "/buddies", label: "Buddies" },
];

const navLinksSignedOut = [
  { href: "/", label: "Home" },
  { href: "/auth/signin", label: "Sign in" },
  { href: "/auth/signup", label: "Sign up" },
];

const navLinkClass =
  "block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const navLinkActiveClass = "bg-surface-muted text-primary";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSignedIn = status === "authenticated" && !!session?.user;
  const links = isSignedIn ? navLinksSignedIn : navLinksSignedOut;
  const currentPath = pathname ?? "/";

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  const handleNavClick = () => setMobileOpen(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-foreground transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <span className="hidden sm:inline">TrackMate</span>
          <span className="sm:hidden">TM</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${navLinkClass} ${isActive(href) ? navLinkActiveClass : ""}`}
            >
              {label}
            </Link>
          ))}
          {isSignedIn && (
            <Link
              href="/api/auth/signout"
              className={navLinkClass}
            >
              Sign out
            </Link>
          )}
        </nav>

        {/* Right side: theme toggle + mobile menu button */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="shrink-0" />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav - slide down */}
      <div
        id="mobile-nav"
        className={`border-t border-border bg-background md:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <nav className="flex flex-col gap-0.5 px-4 py-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`${navLinkClass} ${isActive(href) ? navLinkActiveClass : ""}`}
            >
              {label}
            </Link>
          ))}
          {isSignedIn && (
            <Link
              href="/api/auth/signout"
              onClick={handleNavClick}
              className={navLinkClass}
            >
              Sign out
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
