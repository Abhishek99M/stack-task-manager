import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/25 ring-1 ring-violet-400/40">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2h4v4H2V2zm6 0h4v4H8V2zM2 8h4v4H2V8zm6 0h4v4H8V8z"
              fill="white"
              fillOpacity="0.95"
            />
          </svg>
        </div>
      </div>
      {showWord && (
        <span className="font-semibold tracking-tight text-foreground">
          Stack
        </span>
      )}
    </div>
  );
}
