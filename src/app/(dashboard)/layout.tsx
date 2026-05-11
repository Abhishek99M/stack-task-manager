import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-violet opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-[0.2]" />

      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        <Topbar user={session.user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
