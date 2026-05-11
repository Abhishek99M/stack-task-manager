import { LogOut, User as UserIcon } from "lucide-react";
import type { Session } from "next-auth";

import { initials } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ user }: { user: Session["user"] }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/70 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center md:hidden">
        <Logo />
      </div>

      <div className="hidden flex-1 md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 px-2 pr-3 hover:bg-accent/70"
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-violet-500/15 text-xs font-medium text-violet-300">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline-block">
              {user.name ?? user.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium leading-none">
                {user.name ?? "Account"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserIcon className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logoutAction}>
            <DropdownMenuItem asChild>
              <button
                type="submit"
                className="w-full text-destructive focus:text-destructive"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
