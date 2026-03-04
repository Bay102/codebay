"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export type AuthContextValue<TDatabase = unknown> = {
  supabase: SupabaseClient<TDatabase> | null;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

// Internally store the context as `any` to avoid React Context generic
// variance issues across different database types. Consumers use `useAuth`
// with their concrete `TDatabase` type.
const AuthContext = createContext<AuthContextValue<any> | null>(null);

export interface AuthProviderProps<TDatabase = unknown> {
  children: ReactNode;
  /**
   * Factory for creating (or retrieving) a browser Supabase client.
   * May return null when Supabase is not configured in the environment.
   */
  createClient: () => SupabaseClient<TDatabase> | null;
}

export function AuthProvider<TDatabase>({
  children,
  createClient,
}: AuthProviderProps<TDatabase>) {
  const supabase = useMemo(() => createClient(), [createClient]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const initializeAuth = async () => {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(activeSession);
      setIsLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue<TDatabase>>(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      isLoading,
    }),
    [supabase, session, isLoading],
  );

  return (
    <AuthContext.Provider value={value as AuthContextValue<any>}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth<TDatabase = unknown>(): AuthContextValue<TDatabase> {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context as AuthContextValue<TDatabase>;
}

