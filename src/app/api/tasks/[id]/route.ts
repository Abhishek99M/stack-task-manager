import { NextRequest } from "next/server";
import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleAuthError, requireMembership } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  order: z.number().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });
    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }
    await requireMembership(task.projectId);

    const body = await req.json().catch(() => ({}));
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    if (parsed.data.assigneeId) {
      const isMember = await prisma.membership.findUnique({
        where: {
          userId_projectId: {
            userId: parsed.data.assigneeId,
            projectId: task.projectId,
          },
        },
      });
      if (!isMember) {
        return Response.json(
          { error: "Assignee must be a project member." },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined && {
          title: parsed.data.title.trim(),
        }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description?.trim() || null,
        }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        ...(parsed.data.priority !== undefined && {
          priority: parsed.data.priority,
        }),
        ...(parsed.data.dueDate !== undefined && {
          dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        }),
        ...(parsed.data.assigneeId !== undefined && {
          assigneeId: parsed.data.assigneeId || null,
        }),
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return Response.json({ task: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });
    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }
    await requireMembership(task.projectId);

    await prisma.task.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
