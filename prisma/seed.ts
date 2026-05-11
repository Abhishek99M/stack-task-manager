/* eslint-disable no-console */
import { PrismaClient, Role, TaskPriority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

const users = [
  { email: "admin@stack.demo", name: "Alex Chen", role: Role.ADMIN },
  { email: "designer@stack.demo", name: "Priya Patel", role: Role.MEMBER },
  { email: "engineer@stack.demo", name: "Marco Silva", role: Role.MEMBER },
];

function daysFromNow(d: number) {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t;
}

async function main() {
  console.log("→ Cleaning existing seed data…");
  await prisma.task.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany({ where: { email: { in: users.map((u) => u.email) } } });

  console.log("→ Creating demo users…");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const created = await Promise.all(
    users.map((u) =>
      prisma.user.create({
        data: { email: u.email, name: u.name, passwordHash },
      }),
    ),
  );
  const [admin, designer, engineer] = created;

  console.log("→ Creating Stack v1 Launch project…");
  const stack = await prisma.project.create({
    data: {
      name: "Stack v1 Launch",
      description:
        "Ship the first public version of Stack: marketing site, onboarding flow, and core task management.",
      color: "#8b5cf6",
      ownerId: admin.id,
      memberships: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: designer.id, role: Role.MEMBER },
          { userId: engineer.id, role: Role.MEMBER },
        ],
      },
    },
  });

  console.log("→ Creating tasks for Stack v1 Launch…");
  const stackTasks = [
    { title: "Design landing page hero", status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: designer.id },
    { title: "Set up Next.js + Prisma + Postgres scaffold", status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: engineer.id },
    { title: "Auth: signup, login, sessions", status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: engineer.id },
    { title: "Build drag-and-drop Kanban board", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, assigneeId: engineer.id, dueDate: daysFromNow(2) },
    { title: "Polish empty states + skeletons", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, assigneeId: designer.id, dueDate: daysFromNow(1) },
    { title: "Add member invitation flow", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: admin.id },
    { title: "Set up Railway deployment", status: TaskStatus.TODO, priority: TaskPriority.URGENT, assigneeId: admin.id, dueDate: daysFromNow(-1) },
    { title: "Write README with hero GIF + setup", status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: admin.id, dueDate: daysFromNow(0) },
    { title: "Record 2-5 minute demo video", status: TaskStatus.TODO, priority: TaskPriority.HIGH, dueDate: daysFromNow(1) },
    { title: "Add toast confirmations on mutations", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: designer.id, dueDate: daysFromNow(3) },
    { title: "Add loading skeletons for all pages", status: TaskStatus.TODO, priority: TaskPriority.LOW, assigneeId: designer.id },
    { title: "Add 404 + global error pages", status: TaskStatus.TODO, priority: TaskPriority.LOW },
  ];

  for (let i = 0; i < stackTasks.length; i++) {
    const t = stackTasks[i];
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId ?? null,
        dueDate: t.dueDate ?? null,
        order: (i + 1) * 1000,
        projectId: stack.id,
        createdById: admin.id,
      },
    });
  }

  console.log("→ Creating Q3 Marketing Push project…");
  const marketing = await prisma.project.create({
    data: {
      name: "Q3 Marketing Push",
      description: "Coordinate the Q3 outbound campaign across content, ads, and partnerships.",
      color: "#10b981",
      ownerId: designer.id,
      memberships: {
        create: [
          { userId: designer.id, role: Role.ADMIN },
          { userId: admin.id, role: Role.MEMBER },
        ],
      },
    },
  });

  const marketingTasks = [
    { title: "Draft launch announcement blog post", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: designer.id, dueDate: daysFromNow(2) },
    { title: "Design social media graphics", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: designer.id, dueDate: daysFromNow(4) },
    { title: "Set up email drip sequence", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: daysFromNow(5) },
    { title: "Define KPIs and tracking", status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: admin.id },
  ];

  for (let i = 0; i < marketingTasks.length; i++) {
    const t = marketingTasks[i];
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId ?? null,
        dueDate: t.dueDate ?? null,
        order: (i + 1) * 1000,
        projectId: marketing.id,
        createdById: designer.id,
      },
    });
  }

  console.log("\n✓ Seed complete!\n");
  console.log("Demo credentials (password is the same for all):");
  console.log(`  Password: ${DEMO_PASSWORD}\n`);
  for (const u of users) {
    console.log(`  ${u.role.padEnd(6)} · ${u.email}  (${u.name})`);
  }
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
