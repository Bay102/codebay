"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { TablesInsert } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AuthMode = "signup" | "signin";

const usernamePattern = /^[a-z0-9_]{3,32}$/;

export function CommunityAuthCard() {
  const router = useRouter();
  const { supabase, session, isLoading: isCheckingSession } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    const { error: profileError } = await supabase
      .from("community_users")
      .upsert(payload, { onConflict: "id" });

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
    router.push("/community/dashboard");
    router.refresh();
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    router.push("/community/dashboard");
    router.refresh();
  };

  const handleSignOut = async () => {
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

  if (session) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Community Access</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">You are already signed in</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Your session is active and persisted. Continue to your dashboard to access community features.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => router.push("/community/dashboard")}>
            Open dashboard
          </Button>
          <Button type="button" variant="outline" onClick={() => void handleSignOut()} disabled={isSubmitting}>
            {isSubmitting ? "Signing out..." : "Switch account"}
          </Button>
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
              <Label htmlFor="community-name">Name</Label>
              <Input
                id="community-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Developer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-username">Username</Label>
              <Input
                id="community-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="jane_dev"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-email">Email</Label>
            <Input
              id="community-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@codebay.dev"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-password">Password</Label>
            <Input
              id="community-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-bio">Bio (optional)</Label>
            <Textarea
              id="community-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What are you building right now?"
              rows={3}
              maxLength={400}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Join the community"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(event) => void handleSignIn(event)}>
          <div className="space-y-2">
            <Label htmlFor="community-signin-email">Email</Label>
            <Input
              id="community-signin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@codebay.dev"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="community-signin-password">Password</Label>
            <Input
              id="community-signin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in to community"}
          </Button>
        </form>
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
