"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function currentCallbackUrl() {
  if (typeof window === "undefined") return "/shop";
  return `${window.location.pathname}${window.location.search}` || "/shop";
}

export function useRequireAuthAction() {
  const router = useRouter();
  const { status } = useSession();
  const isCheckingAuth = status === "loading";
  const isAuthenticated = status === "authenticated";

  function requireAuth() {
    if (isCheckingAuth) return false;
    if (isAuthenticated) return true;

    router.push(`/register?callbackUrl=${encodeURIComponent(currentCallbackUrl())}`);
    return false;
  }

  return { isCheckingAuth, isAuthenticated, requireAuth };
}
