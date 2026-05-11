import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  handleAuthError,
  requireMembership,
  requireProjectAdmin,
} from "@/lib/auth-helpers";

export const runtime = "nodejs";

const updateProjectSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const { user, membership } = await requireMembership(id);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        memberships: {
          orderBy: { joinedAt: "asc" },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json({
      project,
      myRole: membership.role,
      myId: user.id,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await requireProjectAdmin(id);

    const body = await req.json().catch(() => ({}));
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name.trim() }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description?.trim() || null,
        }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      },
    });

    return Response.json({ project: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await requireProjectAdmin(id);
    await prisma.project.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
