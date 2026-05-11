import { NextRequest } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleAuthError, requireUser } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
    .optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const projects = await prisma.project.findMany({
      where: { memberships: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { tasks: true, memberships: true } },
        memberships: {
          where: { userId: user.id },
          select: { role: true },
          take: 1,
        },
      },
    });

    const shaped = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      taskCount: p._count.tasks,
      memberCount: p._count.memberships,
      myRole: p.memberships[0]?.role ?? Role.MEMBER,
      updatedAt: p.updatedAt,
    }));

    return Response.json({ projects: shaped });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        color: parsed.data.color ?? "#8b5cf6",
        ownerId: user.id,
        memberships: {
          create: { userId: user.id, role: Role.ADMIN },
        },
      },
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
