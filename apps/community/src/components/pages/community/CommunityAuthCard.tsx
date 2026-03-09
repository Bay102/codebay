"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { AuthEmailPasswordForm, SurfaceCard } from "@codebay/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { TablesInsert } from "@/lib/database";
import { blogUrl, mainUrl, siteUrl } from "@/lib/site-urls";

type AuthMode = "signup" | "signin";

type OAuthProvider = "google" | "github" | "apple";

const OAUTH_PROVIDERS: { provider: OAuthProvider; label: string }[] = [
  { provider: "google", label: "Google" },
  { provider: "github", label: "GitHub" },
  { provider: "apple", label: "Apple" }
];

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-1.18 1.62-2.54 3.19-4.53 3.2-.9 0-1.43-.27-2.15-.27-.75 0-1.54.13-2.35.27zM12.03 7.25c1.36-1.65 1.16-4.09-.07-5.56-1.28-1.45-3.35-1.68-4.89-.34-1.34 1.28-1.16 3.84.07 5.55 1.28 1.48 3.4 1.68 4.89.35z" />
    </svg>
  );
}

function OAuthProviderIcon({ provider, className }: { provider: OAuthProvider; className?: string }) {
  switch (provider) {
    case "google":
      return <GoogleIcon className={className} />;
    case "github":
      return <GitHubIcon className={className} />;
    case "apple":
      return <AppleIcon className={className} />;
  }
}

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
  const [mode, setMode] = useState<AuthMode>(() => (searchParams.get("mode") === "signin" ? "signin" : "signup"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState<OAuthProvider | null>(null);
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

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    if (!supabase) return;
    setError(null);
    setSuccess(null);
    setOauthSubmitting(provider);
    // Use current origin so OAuth redirects back to the same host (localhost in dev, production in prod).
    const origin =
      typeof window !== "undefined" ? window.location.origin : new URL(siteUrl).origin;
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectDestination)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl }
    });
    setOauthSubmitting(null);
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  if (isCheckingSession) {
    return (
      <SurfaceCard variant="panel">
        <p className="text-sm text-muted-foreground">Checking your community session...</p>
      </SurfaceCard>
    );
  }

  if (!supabase) {
    return (
      <SurfaceCard variant="panel">
        <p className="text-sm text-muted-foreground">
          Community authentication is unavailable until Supabase environment variables are configured.
        </p>
      </SurfaceCard>
    );
  }

  if (session) {
    return (
      <SurfaceCard variant="panel">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Community Access</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Welcome back!</h2>
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
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard variant="panel">
      <div className="mb-6 flex items-center gap-2 rounded-full border border-border/70 p-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
            setSuccess(null);
          }}
          className={`rounded-full px-3 py-1.5 transition-colors ${mode === "signup" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
            setSuccess(null);
          }}
          className={`rounded-full px-3 py-1.5 transition-colors ${mode === "signin" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Sign in
        </button>
      </div>

      {!showEmailForm ? (
        <>
          <p className="mb-3 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Create an account with" : "Sign in with"}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {OAUTH_PROVIDERS.map(({ provider, label }) => (
              <button
                key={provider}
                type="button"
                onClick={() => void handleOAuthSignIn(provider)}
                disabled={oauthSubmitting !== null || isSubmitting}
                className="inline-flex h-11 flex-1 min-w-0 items-center justify-center gap-2 rounded-md border border-input bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[120px] sm:px-4 sm:py-2"
                aria-label={`Sign in with ${label}`}
              >
                <OAuthProviderIcon provider={provider} className="h-5 w-5 shrink-0" />
                {oauthSubmitting === provider ? "Redirecting…" : label}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="text-sm text-muted-foreground underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/50"
            >
              {mode === "signup" ? "Create account with email instead" : "Sign in with email instead"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back
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
                  placeholder="you@codebay.solutions"
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
        </>
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
    </SurfaceCard>
  );
}
