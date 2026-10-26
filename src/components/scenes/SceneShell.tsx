"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React from "react";
import { cn } from "@/lib/utils";

export const SCENE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Common ground for the coded product scenes: a black well, a container-query
 * root so each scene adapts to the frame it sits in, and an optional
 * "demo data" tag. Scenes are illustrative recreations of real products, in
 * black and white; each one assembles itself the first time it is seen.
 */
export function SceneShell({
  children,
  className,
  tag = false,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  tag?: boolean;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label}. Interface recreation with demo data.`}
      className={cn("tokens-dark @container relative h-full w-full overflow-hidden bg-[oklch(0.115_0_0)] text-fg", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(90% 70% at 50% 0%, oklch(1 0 0 / 0.05), transparent 70%)" }}
      />
      <div aria-hidden className="relative h-full w-full">
        {children}
      </div>
      {tag && (
        <span
          aria-hidden
          className="absolute bottom-2.5 right-3 rounded-full border border-white/[0.08] bg-black/70 px-2 py-0.5 font-mono text-[9.5px] text-fg-subtle backdrop-blur"
        >
          demo data
        </span>
      )}
    </div>
  );
}

/**
 * Rises a piece of a scene into place once the scene is on screen. Scenes sit
 * in frames that may already be visible, so it keys off the element itself.
 */
export function Assemble({
  children,
  className,
  delay = 0,
  y = 10,
  x = 0,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: SCENE_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function LivePill({ className, children = "Live" }: { className?: string; children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2 py-0.5 text-[10.5px] font-medium text-fg",
        className
      )}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-fg opacity-60 motion-reduce:hidden" />
        <span className="relative size-1.5 rounded-full bg-fg" />
      </span>
      {children}
    </span>
  );
}

export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[10px] tracking-[0.01em] text-fg-subtle", className)}>{children}</span>;
}
