import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { SignupForm } from "./signup-form";

export const metadata = { title: "Create account · Stack" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-7 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start shipping with your team in minutes.
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
