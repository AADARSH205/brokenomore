import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  X,
  Landmark,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/site/ThemeToggle";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/budget", label: "Budget planner", icon: Wallet },
  { to: "/tax", label: "Tax planner", icon: Landmark },
  { to: "/investments", label: "SIP & investments", icon: TrendingUp },
  { to: "/goals", label: "Saving goals", icon: Target },
  { to: "/learn", label: "Financial education", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-baseline gap-1 text-lg font-semibold tracking-tight">
      <span className="font-display">Broke</span>
      <span className="rounded-md bg-primary px-1.5 py-0.5 text-sm font-semibold text-primary-foreground">
        NoMore
      </span>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }) {
  return (
    <ul className="space-y-1">
      {APP_NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/50 px-4 py-6 lg:flex">
        <Brand />
        <div className="mt-8 flex-1 overflow-y-auto thin-scroll">
          <NavLinks pathname={pathname} />
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <p className="truncate px-1 text-xs text-muted-foreground">{user?.email ?? "Signed in"}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="app-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
            >
              {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <div id="app-menu" className="border-t border-border px-3 py-3">
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => logout()}
              className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}