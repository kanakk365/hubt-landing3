import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * HubTech wordmark. The official logo mark has not been supplied yet, so the
 * site sets the name only. Drop the real mark in here when it arrives.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="HubTech home"
      className={cn(
        "inline-flex items-center rounded-md text-fg transition-[color,opacity] duration-300 hover:opacity-85",
        className
      )}
    >
      <span className="font-display text-[1.1875rem] font-semibold tracking-[-0.035em] [font-stretch:110%]">
        HubTech
      </span>
    </Link>
  );
}
