import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AdminChatHistoryDialog } from "@/components/pages/admin/AdminChatHistoryDialog";
import { AdminDashboardHeader } from "@/components/pages/admin/AdminDashboardHeader";
import { AdminHandoffsSection } from "@/components/pages/admin/AdminHandoffsSection";
import { AdminSessionLoading } from "@/components/pages/admin/AdminSessionLoading";
import { AdminSignInForm } from "@/components/pages/admin/AdminSignInForm";
import { supabase } from "@/lib/supabase";
import {
  getChatHandoffs,
  updateChatHandoffArchived,
  type ChatHandoffRecord,
} from "../../supabase/api/api";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [handoffs, setHandoffs] = useState<ChatHandoffRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedHandoff, setSelectedHandoff] = useState<ChatHandoffRecord | null>(null);
  const [updatingArchivedById, setUpdatingArchivedById] = useState<Record<string, boolean>>({});
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  const fetchChatHandoffs = useCallback(async () => {
    setIsLoading(true);
    const result = await getChatHandoffs();
    setHandoffs(result.data);
    setError(result.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setAuthError(sessionError.message);
      }

      setSession(data.session ?? null);
      setIsAuthLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setHandoffs([]);
        setSelectedHandoff(null);
        setError(null);
        setActionError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    void fetchChatHandoffs();
  }, [fetchChatHandoffs, session]);

  const stats = useMemo(() => {
    const total = handoffs.length;
    const read = handoffs.filter((handoff) => handoff.archived === true).length;
    const newLeads = total - read;

    return { total, read, newLeads };
  }, [handoffs]);
  const newHandoffs = useMemo(
    () => handoffs.filter((handoff) => handoff.archived !== true),
    [handoffs]
  );
  const archivedHandoffs = useMemo(
    () => handoffs.filter((handoff) => handoff.archived === true),
    [handoffs]
  );

  const handleToggleArchived = useCallback(
    async (handoffId: string, currentArchived: boolean | null) => {
      const nextArchived = currentArchived !== true;
      setActionError(null);
      setUpdatingArchivedById((prev) => ({ ...prev, [handoffId]: true }));

      const result = await updateChatHandoffArchived(handoffId, nextArchived);

      if (!result.success) {
        setActionError(result.error ?? "Unable to update archived status.");
      } else {
        const persistedArchived = result.data?.archived === true;
        setHandoffs((prev) =>
          prev.map((handoff) =>
            handoff.id === handoffId ? { ...handoff, archived: persistedArchived } : handoff
          )
        );
        setSelectedHandoff((prev) =>
          prev && prev.id === handoffId ? { ...prev, archived: persistedArchived } : prev
        );
      }

      setUpdatingArchivedById((prev) => {
        const nextState = { ...prev };
        delete nextState[handoffId];
        return nextState;
      });
    },
    []
  );

  const handleSignIn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthError(null);

      const normalizedEmail = loginEmail.trim();
      if (!normalizedEmail || !loginPassword) {
        setAuthError("Please enter both email and password.");
        return;
      }

      setIsSigningIn(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: loginPassword,
      });

      if (signInError) {
        setAuthError(signInError.message);
      } else {
        setLoginPassword("");
      }

      setIsSigningIn(false);
    },
    [loginEmail, loginPassword]
  );

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    setIsSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setAuthError(signOutError.message);
    }
    setIsSigningOut(false);
  }, []);

  if (isAuthLoading) {
    return <AdminSessionLoading />;
  }

  if (!session) {
    return (
      <AdminSignInForm
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        authError={authError}
        isSigningIn={isSigningIn}
        onLoginEmailChange={setLoginEmail}
        onLoginPasswordChange={setLoginPassword}
        onSubmit={handleSignIn}
      />
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <AdminDashboardHeader
            userEmail={session.user.email}
            stats={stats}
            isLoading={isLoading}
            isSigningOut={isSigningOut}
            onRefresh={() => void fetchChatHandoffs()}
            onSignOut={() => void handleSignOut()}
          />

          <AdminHandoffsSection
            error={error}
            actionError={actionError}
            authError={authError}
            isLoading={isLoading}
            newHandoffs={newHandoffs}
            archivedHandoffs={archivedHandoffs}
            isArchivedOpen={isArchivedOpen}
            onArchivedOpenChange={setIsArchivedOpen}
            updatingArchivedById={updatingArchivedById}
            onSelectHandoff={setSelectedHandoff}
            onToggleArchived={handleToggleArchived}
          />
        </div>
      </div>
      <AdminChatHistoryDialog
        selectedHandoff={selectedHandoff}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedHandoff(null);
          }
        }}
      />
    </>
  );
};

export default Admin;
