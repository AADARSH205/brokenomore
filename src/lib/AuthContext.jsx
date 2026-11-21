const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo } from "react";

import { currentUrl } from "@/lib/authReturnTo";
import { isSupabaseConfigured, supabase, supabaseGetUser, supabaseSignOut } from "@/lib/supabase";

/**
 * The visitor, resolved once per page load and cached in the router's QueryClient:
 * - When Supabase is configured: reads session from Supabase Auth
 * - Fallback: checks db.auth
 */
export const authQuery = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    if (isSupabaseConfigured) {
      try {
        const user = await supabaseGetUser();
        return { user, error: null };
      } catch (err) {
        return { user: null, error: err };
      }
    }

    // Fallback mode
    if (!db.auth.hasToken()) return { user: null, error: null };
    try {
      return { user: await db.auth.me(), error: null };
    } catch (err) {
      if (err?.data?.extra_data?.reason === "user_not_registered") {
        return { user: null, error: { type: "user_not_registered", message: "Not registered" } };
      }
      if (err?.status === 401 || err?.status === 403) return { user: null, error: null };
      throw err;
    }
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery(authQuery);

  // Sync Supabase auth state changes automatically
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.setQueryData(authQuery.queryKey, {
        user: session?.user ?? null,
        error: null,
      });
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoadingAuth: isPending,
      authError: data?.error ?? (error ? { type: "unknown", message: error.message ?? "Failed to load session" } : null),
      refresh: () => queryClient.fetchQuery({ ...authQuery, staleTime: 0 }),
      logout: async () => {
        queryClient.setQueryData(authQuery.queryKey, { user: null, error: null });
        if (isSupabaseConfigured) {
          await supabaseSignOut();
          window.location.href = "/";
        } else {
          db.auth.logout(window.location.origin);
        }
      },
      navigateToLogin: () => {
        if (isSupabaseConfigured) {
          window.location.href = `/login?returnTo=${encodeURIComponent(currentUrl())}`;
        } else {
          db.auth.redirectToLogin(currentUrl());
        }
      },
    }),
    [data, error, isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
