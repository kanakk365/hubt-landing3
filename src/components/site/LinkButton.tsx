import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

/** Secondary ghost pill with a small signal dot, or a trailing mark in its place. */
export function LinkButton({
  href,
  children,
  size = "lg",
  className,
  trailing,
}: {
  href: string;
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full border border-line-strong bg-fg/[0.035] font-medium tracking-[-0.01em] text-fg backdrop-blur-md transition-[background-color,border-color] duration-300 hover:border-signal/45 hover:bg-signal/[0.06] bw:hover:border-fg/25 bw:hover:bg-fg/[0.07]",
        size === "lg" ? "h-[3.25rem] px-6 text-[0.9375rem]" : "h-11 px-5 text-[0.9375rem]",
        className
      )}
    >
      {children}
      {trailing ?? (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-violet shadow-[0_0_10px_var(--dot-glow)] transition-transform duration-300 group-hover:scale-150"
        />
      )}
    </Link>
  );
}
