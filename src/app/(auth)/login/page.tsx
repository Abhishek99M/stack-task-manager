import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in · Stack" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-7 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Stack account to continue.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
