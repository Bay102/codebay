"use client";

import type { FormEvent } from "react";

export type AuthEmailPasswordFormProps = {
  email: string;
  password: string;
  emailId: string;
  passwordId: string;
  emailLabel?: string;
  passwordLabel?: string;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function AuthEmailPasswordForm({
  email,
  password,
  emailId,
  passwordId,
  emailLabel = "Email",
  passwordLabel = "Password",
  submitLabel,
  submittingLabel,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: AuthEmailPasswordFormProps) {
  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <div className="space-y-2">
        <label htmlFor={emailId} className="text-sm font-medium">
          {emailLabel}
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="you@codebay.solutions"
          autoComplete="email"
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={passwordId} className="text-sm font-medium">
          {passwordLabel}
        </label>
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
