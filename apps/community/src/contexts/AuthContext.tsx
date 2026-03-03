"use client";

import type { ReactNode } from "react";
import type { Database } from "@/lib/database";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  AuthProvider as SharedAuthProvider,
  useAuth as useSharedAuth,
  type AuthContextValue as SharedAuthContextValue,
} from "@codebay/auth";

export type AuthContextValue = SharedAuthContextValue<Database>;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SharedAuthProvider<Database> createClient={createBrowserSupabaseClient}>
      {children}
    </SharedAuthProvider>
  );
}

export function useAuth() {
  return useSharedAuth<Database>();
}

