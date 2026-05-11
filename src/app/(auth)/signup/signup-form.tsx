"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type SignupState } from "@/lib/actions/auth";

const initial: SignupState = { ok: false };

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initial);

  return (
    <form action={action} className="space-y-4">
      <Field
        id="name"
        label="Name"
        type="text"
        placeholder="Ada Lovelace"
        autoComplete="name"
        error={state.fieldErrors?.name}
      />
      <Field
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <Field
        id="password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
      />

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error || undefined}
        required
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full shadow-lg shadow-violet-600/20"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}
