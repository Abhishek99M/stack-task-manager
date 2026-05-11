import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("You must be signed in.", 401);
  }
  return session.user as { id: string; email: string; name?: string | null };
}

export async function requireMembership(projectId: string) {
  const user = await requireUser();
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!membership) {
    throw new AuthError("You don't have access to this project.", 403);
  }
  return { user, membership };
}

export async function requireProjectAdmin(projectId: string) {
  const ctx = await requireMembership(projectId);
  if (ctx.membership.role !== Role.ADMIN) {
    throw new AuthError(
      "Only project admins can perform this action.",
      403,
    );
  }
  return ctx;
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
