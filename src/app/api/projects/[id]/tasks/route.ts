import { NextRequest } from "next/server";
import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleAuthError, requireMembership } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable().or(z.literal("")),
  assigneeId: z.string().cuid().optional().nullable().or(z.literal("")),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const { user } = await requireMembership(id);

    const body = await req.json().catch(() => ({}));
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const status = parsed.data.status ?? TaskStatus.TODO;

    if (parsed.data.assigneeId) {
      const isMember = await prisma.membership.findUnique({
        where: {
          userId_projectId: { userId: parsed.data.assigneeId, projectId: id },
        },
      });
      if (!isMember) {
        return Response.json(
          { error: "Assignee must be a project member." },
          { status: 400 },
        );
      }
    }

    const last = await prisma.task.findFirst({
      where: { projectId: id, status },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 0) + 1000;

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        status,
        priority: parsed.data.priority ?? TaskPriority.MEDIUM,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assigneeId: parsed.data.assigneeId || null,
        createdById: user.id,
        projectId: id,
        order: nextOrder,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
