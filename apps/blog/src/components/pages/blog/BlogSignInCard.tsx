"use client";

import { AuthEmailPasswordForm } from "@codebay/ui";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { communityUrl, siteUrl } from "@/lib/site-urls";
import { getBlogSupabaseClient } from "@/lib/supabase";

function getSafeRedirectPath(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
}

export function BlogSignInCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getBlogSupabaseClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
  const joinHref = `${communityUrl}/join?redirect=${encodeURIComponent(`${siteUrl}${redirectPath}`)}`;

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setIsCheckingSession(false);
    });

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

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setError(null);
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

    router.push(redirectPath);
    router.refresh();
  };

  if (isCheckingSession) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">Checking your session...</p>
      </section>
    );
  }

  if (!supabase) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">
          Blog authentication is unavailable until Supabase environment variables are configured.
        </p>
      </section>
    );
  }

  if (session) {
    return (
      <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Signed in</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Your blog session is active</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Continue back to your article and engage with reactions and comments.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => router.push(redirectPath)}
        >
          Continue
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">Sign in</p>
      <h2 className="mt-2 text-2xl font-semibold text-foreground">Access comments and reactions</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        Sign in with your existing community account. Need an account?{" "}
        <Link href={joinHref} className="text-primary underline-offset-4 hover:underline">
          Join the community
        </Link>
        .
      </p>

      <div className="mt-6">
        <AuthEmailPasswordForm
          email={email}
          password={password}
          emailId="blog-signin-email"
          passwordId="blog-signin-password"
          submitLabel="Sign in to blog"
          submittingLabel="Signing in..."
          isSubmitting={isSubmitting}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignIn}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
