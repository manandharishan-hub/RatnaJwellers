"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { AccountStateSync } from "@/components/providers/AccountStateSync";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AccountStateSync />
      {children}
    </SessionProvider>
  );
}
