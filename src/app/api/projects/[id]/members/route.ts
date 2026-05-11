import { NextRequest } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleAuthError, requireProjectAdmin } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const addMemberSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.nativeEnum(Role).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await requireProjectAdmin(id);

    const body = await req.json().catch(() => ({}));
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { error: "No Stack user found with that email. Ask them to sign up first." },
        { status: 404 },
      );
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: id } },
    });
    if (existing) {
      return Response.json(
        { error: "This user is already a member of the project." },
        { status: 409 },
      );
    }

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        projectId: id,
        role: parsed.data.role ?? Role.MEMBER,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return Response.json({ membership }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
