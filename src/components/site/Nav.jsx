const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { site } from "@/config/site";
import ThemeToggle from "@/components/site/ThemeToggle";
import LanguageToggle from "@/components/site/LanguageToggle";

export default function Nav({ base = "" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled || open
          ? "border-border bg-background/95 backdrop-blur-md"
          : "border-transparent bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a href={`${base}#top`} className="flex items-baseline gap-1 text-lg font-semibold tracking-tight text-foreground">
          <span className="font-display">Broke</span>
          <span className="rounded-md bg-primary px-1.5 py-0.5 text-sm font-semibold text-primary-foreground">
            NoMore
          </span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={`${base}${item.href}`}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {!isLoadingAuth && isAuthenticated ? (
            <Link
              to="/dashboard"
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                search={{ returnTo: "/dashboard" }}
                className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                search={{ returnTo: "/dashboard" }}
                className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
              >
                Start free
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background px-5 pb-5 pt-2 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={`${base}${item.href}`}
                onClick={close}
                className="border-b border-border/60 py-3 text-base text-foreground last:border-0"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              onClick={close}
              className="flex items-center justify-center rounded-full border border-border px-4 py-3 text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={close}
              className="flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              Start free
            </Link>
          </div>
          <a
            href={`${base}#book`}
            onClick={() => {
              close();
              try { db?.analytics?.track?.({ eventName: "nav_book_demo_click" }); } catch {}
            }}
            className="mt-2 flex w-full items-center justify-center px-4 py-2 text-xs font-medium text-muted-foreground underline underline-offset-2"
          >
            Or book a 15-min walkthrough
          </a>
        </div>
      )}
    </header>
  );
}