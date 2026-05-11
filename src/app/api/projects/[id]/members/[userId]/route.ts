import { NextRequest } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleAuthError, requireProjectAdmin } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

type Ctx = { params: Promise<{ id: string; userId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id, userId } = await params;
    const { user: actor } = await requireProjectAdmin(id);

    const body = await req.json().catch(() => ({}));
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    if (actor.id === userId && parsed.data.role !== Role.ADMIN) {
      const remainingAdmins = await prisma.membership.count({
        where: { projectId: id, role: Role.ADMIN, userId: { not: userId } },
      });
      if (remainingAdmins === 0) {
        return Response.json(
          { error: "You can't demote yourself — at least one admin is required." },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.membership.update({
      where: { userId_projectId: { userId, projectId: id } },
      data: { role: parsed.data.role },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return Response.json({ membership: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id, userId } = await params;
    const { user: actor } = await requireProjectAdmin(id);

    if (actor.id === userId) {
      const remainingAdmins = await prisma.membership.count({
        where: { projectId: id, role: Role.ADMIN, userId: { not: userId } },
      });
      if (remainingAdmins === 0) {
        return Response.json(
          { error: "You can't remove yourself — at least one admin is required." },
          { status: 400 },
        );
      }
    }

    await prisma.membership.delete({
      where: { userId_projectId: { userId, projectId: id } },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
