"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MoreHorizontal, Plus, UserMinus, UserCog } from "lucide-react";
import { Role } from "@prisma/client";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initials } from "@/lib/utils";

type Member = {
  id: string;
  role: Role;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export function MembersPanel({
  projectId,
  initialMembers,
  isAdmin,
  currentUserId,
}: {
  projectId: string;
  initialMembers: Member[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't invite member.");
        return;
      }
      setMembers((prev) => [...prev, data.membership]);
      toast.success("Member added", {
        description: `${data.membership.user.name} can now collaborate.`,
      });
      setInviteOpen(false);
      setEmail("");
      router.refresh();
    });
  };

  const updateRole = (userId: string, role: Role) => {
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Couldn't update role", { description: data.error });
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role } : m)),
      );
      toast.success(`Role updated to ${role === Role.ADMIN ? "Admin" : "Member"}.`);
      router.refresh();
    });
  };

  const removeMember = (userId: string, name: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Couldn't remove member", { description: data.error });
        return;
      }
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      toast.success("Member removed", { description: `${name} no longer has access.` });
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Members</h3>
          <p className="text-xs text-muted-foreground">
            {members.length} {members.length === 1 ? "person" : "people"}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="size-3.5" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Invite a teammate</DialogTitle>
                  <DialogDescription>
                    Enter the email of an existing Stack user to add them as a Member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="teammate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                        className="pl-9"
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending} className="shadow-lg shadow-violet-600/20">
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    {pending ? "Inviting…" : "Add member"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ul className="space-y-1">
        {members.map((m) => {
          const isYou = m.user.id === currentUserId;
          return (
            <li
              key={m.id}
              className="group flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-accent/50"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-violet-500/15 text-[10px] font-medium text-violet-300">
                  {initials(m.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.user.name} {isYou && <span className="text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <Badge
                variant={m.role === Role.ADMIN ? "secondary" : "outline"}
                className={
                  m.role === Role.ADMIN
                    ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20"
                    : ""
                }
              >
                {m.role === Role.ADMIN ? "Admin" : "Member"}
              </Badge>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100"
                      aria-label={`Manage ${m.user.name}`}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {m.role === Role.MEMBER ? (
                      <DropdownMenuItem onClick={() => updateRole(m.user.id, Role.ADMIN)}>
                        <UserCog className="size-4" /> Promote to Admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => updateRole(m.user.id, Role.MEMBER)}>
                        <UserCog className="size-4" /> Demote to Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => removeMember(m.user.id, m.user.name)}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserMinus className="size-4" /> Remove from project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
