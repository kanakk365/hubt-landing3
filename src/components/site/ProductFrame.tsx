import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import type { Accent } from "@/lib/site";

/**
 * Black window chrome for a coded scene or a real product screenshot. It keeps
 * its dark palette on white sections too. Screens carry demo workspace data,
 * so they say so. `accent` is kept for callers; the site is black and white.
 */
export function ProductFrame({
  label,
  meta,
  className,
  screenClassName,
  children,
  glow = true,
  demo = true,
}: {
  label: string;
  meta?: React.ReactNode;
  accent?: Accent;
  className?: string;
  screenClassName?: string;
  children: React.ReactNode;
  glow?: boolean;
  demo?: boolean;
}) {
  return (
    <div className={cn("tokens-dark relative isolate text-fg", className)}>
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[8%] -bottom-[14%] top-[30%] -z-10 blur-3xl"
          style={{ background: "radial-gradient(60% 60% at 50% 65%, oklch(1 0 0 / 0.07), transparent 72%)" }}
        />
      )}
      <div className="relative rounded-[18px] border border-line bg-[oklch(0.075_0_0)] p-1.5 shadow-[inset_0_1px_0_oklch(1_0_0/0.07),0_40px_80px_-30px_oklch(0_0_0/0.75)]">
        <div className="flex h-9 items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="flex shrink-0 gap-1">
              <span className="size-1.5 rounded-full bg-fg" />
              <span className="size-1.5 rounded-full bg-fg/30" />
              <span className="size-1.5 rounded-full bg-fg/15" />
            </span>
            <span className="ml-1 truncate text-[0.8125rem] font-medium text-fg">{label}</span>
            {meta && <span className="hidden truncate text-[0.8125rem] text-fg-subtle sm:inline">· {meta}</span>}
          </div>
          {demo && (
            <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-fg-subtle">
              Demo data
            </span>
          )}
        </div>
        <div className={cn("relative overflow-hidden rounded-[12px] border border-white/[0.06] bg-black", screenClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FrameImage({
  src,
  alt,
  sizes,
  priority,
  position = "top",
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  position?: "top" | "center";
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", position === "top" ? "object-top" : "object-center", className)}
    />
  );
}
