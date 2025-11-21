import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } =
    options ?? {};
  const loginUrl = redirectPath || (typeof window !== 'undefined' ? getLoginUrl() : '/');
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      // Clear local state immediately
      utils.auth.me.setData(undefined, null);
      
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("manus-runtime-user-info");
      }
      
      // Call logout mutation
      await logoutMutation.mutateAsync();
      
    } catch (error: unknown) {
      console.error("Logout error:", error);
      
      // Even if logout fails, clear local state and redirect
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out, just redirect
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return;
      }
      
      // For any other error, still redirect
      console.warn("Logout failed, but redirecting anyway");
    } finally {
      // Ensure state is cleared
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      
      // Force redirect to home page
      if (typeof window !== "undefined") {
        // Use replace to prevent back button from returning to authenticated page
        window.location.replace("/");
      }
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === loginUrl) return;

    window.location.href = loginUrl
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
