import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminSignInFormProps = {
  loginEmail: string;
  loginPassword: string;
  authError: string | null;
  isSigningIn: boolean;
  onLoginEmailChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
};

export const AdminSignInForm = ({
  loginEmail,
  loginPassword,
  authError,
  isSigningIn,
  onLoginEmailChange,
  onLoginPasswordChange,
  onSubmit,
}: AdminSignInFormProps) => (
  <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-7">
      <div className="space-y-2">
        <p className="text-primary/80 text-xs font-semibold tracking-[0.16em] uppercase">
          Admin Access
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          You must log in with Supabase credentials to access the chat handoff dashboard.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={loginEmail}
            onChange={(event) => onLoginEmailChange(event.target.value)}
            placeholder="admin@yourcompany.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={loginPassword}
            onChange={(event) => onLoginPasswordChange(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {authError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {authError}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSigningIn}>
          {isSigningIn ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in to Admin"
          )}
        </Button>
      </form>
    </div>
  </div>
);
