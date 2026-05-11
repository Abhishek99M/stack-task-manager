import { NextRequest } from "next/server";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleAuthError, requireMembership } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const reorderSchema = z.object({
  projectId: z.string().cuid(),
  updates: z
    .array(
      z.object({
        id: z.string().cuid(),
        status: z.nativeEnum(TaskStatus),
        order: z.number(),
      }),
    )
    .min(1)
    .max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    await requireMembership(parsed.data.projectId);

    // Validate all task IDs belong to this project, in one query
    const ids = parsed.data.updates.map((u) => u.id);
    const count = await prisma.task.count({
      where: { id: { in: ids }, projectId: parsed.data.projectId },
    });
    if (count !== ids.length) {
      return Response.json(
        { error: "Some tasks don't belong to this project." },
        { status: 400 },
      );
    }

    await prisma.$transaction(
      parsed.data.updates.map((u) =>
        prisma.task.update({
          where: { id: u.id },
          data: { status: u.status, order: u.order },
        }),
      ),
    );

    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
