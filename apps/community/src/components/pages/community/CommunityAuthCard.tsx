"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { AuthEmailPasswordForm } from "@codebay/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { TablesInsert } from "@/lib/database";
import { blogUrl, mainUrl, siteUrl } from "@/lib/site-urls";

type AuthMode = "signup" | "signin";

const usernamePattern = /^[a-z0-9_]{3,32}$/;
const fallbackRedirectPath = "/dashboard";

const allowedRedirectOrigins = new Set(
  [siteUrl, blogUrl, mainUrl].map((url) => {
    try {
      return new URL(url).origin;
    } catch {
      return "";
    }
  })
);

function resolveRedirectDestination(rawRedirect: string | null): string {
  if (!rawRedirect) {
    return fallbackRedirectPath;
  }

  if (rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")) {
    return rawRedirect;
  }

  try {
    const parsed = new URL(rawRedirect);
    if (allowedRedirectOrigins.has(parsed.origin)) {
      return parsed.toString();
    }
  } catch {
    return fallbackRedirectPath;
  }

  return fallbackRedirectPath;
}

export function CommunityAuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const redirectDestination = resolveRedirectDestination(searchParams.get("redirect"));

  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      const {
        data: { session: activeSession }
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      setSession(activeSession);
      setIsCheckingSession(false);
    };

    void initializeAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError(null);
    setSuccess(null);

    const normalizedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!usernamePattern.test(normalizedUsername)) {
      setError("Username must be 3-32 characters and use only lowercase letters, numbers, or underscores.");
      return;
    }

    setIsSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: normalizedName,
          username: normalizedUsername
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setIsSubmitting(false);
      setSuccess("Account created. Please confirm your email, then sign in to continue.");
      setMode("signin");
      return;
    }

    const payload: TablesInsert<"community_users"> = {
      id: data.session.user.id,
      name: normalizedName,
      username: normalizedUsername,
      bio: bio.trim() || null,
      email: normalizedEmail
    };

    const { error: profileError } = await supabase.from("community_users").upsert(payload, { onConflict: "id" });

    if (profileError) {
      if (profileError.code === "23505") {
        setError("That username is already taken. Please choose another.");
      } else {
        setError(profileError.message);
      }
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.push(redirectDestination);
    router.refresh();
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(redirectDestination);
    router.refresh();
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    await supabase.auth.signOut();
    setIsSubmitting(false);
  };

  if (isCheckingSession) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">Checking your community session...</p>
      </section>
    );
  }

  if (!supabase) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">
          Community authentication is unavailable until Supabase environment variables are configured.
        </p>
      </section>
    );
  }

  if (session) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Community Access</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">You are already signed in</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Your session is active and persisted. Continue to your dashboard to access community features.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => router.push(redirectDestination)}
          >
            Continue
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => void handleSignOut()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2 rounded-full border border-border/70 p-1 text-xs">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            mode === "signup" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            mode === "signin" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign in
        </button>
      </div>

      {mode === "signup" ? (
        <form className="space-y-4" onSubmit={(event) => void handleSignUp(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="community-name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="community-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Developer"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="community-username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="community-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="jane_dev"
                autoComplete="username"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="community-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="community-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@codebay.dev"
              autoComplete="email"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="community-password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="community-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="community-bio" className="text-sm font-medium">
              Bio (optional)
            </label>
            <textarea
              id="community-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What are you building right now?"
              rows={3}
              maxLength={400}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Join the community"}
          </button>
        </form>
      ) : (
        <AuthEmailPasswordForm
          email={email}
          password={password}
          emailId="community-signin-email"
          passwordId="community-signin-password"
          submitLabel="Sign in to community"
          submittingLabel="Signing in..."
          isSubmitting={isSubmitting}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignIn}
        />
      )}

      {error ? (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          {success}
        </p>
      ) : null}
    </section>
  );
}
