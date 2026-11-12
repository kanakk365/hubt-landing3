"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useId, useRef } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** A company secret, shown where it is allowed to be: inside the building. */
export function SecretChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline rounded-[6px] border border-fg/25 bg-fg/[0.08] px-[0.35em] py-[0.05em] font-medium text-fg [box-decoration-break:clone]",
        className
      )}
    >
      {children}
    </span>
  );
}

/** The placeholder that crosses the firewall instead. */
export function TagChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline font-mono text-[0.86em] font-medium text-signal [box-decoration-break:clone]", className)}>{children}</span>
  );
}

/** A secret put back in, inside the office, after the answer returns. */
export function UnlockedChip({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-fg underline decoration-signal decoration-2 underline-offset-[0.22em]">{children}</span>;
}

/**
 * Renders copy with inline markers: {{secret}}, [[TAG]] and <<unlocked>>.
 * Keeps the content as plain strings without reaching for innerHTML.
 */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\{\{.+?\}\}|\[\[.+?\]\]|<<.+?>>)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("{{")) return <SecretChip key={i}>{p.slice(2, -2)}</SecretChip>;
        if (p.startsWith("[[")) return <TagChip key={i}>[{p.slice(2, -2)}]</TagChip>;
        if (p.startsWith("<<")) return <UnlockedChip key={i}>{p.slice(2, -2)}</UnlockedChip>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

/** A row of text tabs with one chosen; the lit pill slides between them, as on the navbar and the product bar. */
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
  tone = "signal",
}: {
  options: readonly { key: K; label: React.ReactNode }[];
  value: K;
  onChange: (k: K) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
  /** "danger" marks the chosen option rose, for the risky side of a comparison. */
  tone?: "signal" | "danger";
}) {
  const id = useId();
  return (
    <div role="group" aria-label={label} className={cn("inline-flex max-w-full flex-wrap items-center gap-0.5", className)}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative rounded-full font-medium tracking-[-0.01em] transition-colors duration-300",
              size === "sm" ? "px-3 py-1.5 text-[0.8125rem]" : "px-4 py-2 text-[0.875rem]",
              on ? (tone === "danger" ? "text-rose" : "text-fg") : "text-fg-subtle hover:text-fg"
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                aria-hidden
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                className={cn("absolute inset-0 rounded-full border bg-fg/[0.06]", tone === "danger" ? "border-rose/40" : "border-line-strong")}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** A small live dot, green unless something was blocked. */
export function LiveDot({ danger, className }: { danger?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-2 shrink-0", className)}>
      <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", danger ? "bg-rose" : "bg-signal")} />
      <span className={cn("relative size-2 rounded-full", danger ? "bg-rose" : "bg-signal")} />
    </span>
  );
}

/** Mono caption, as on the capability cards. */
export function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-subtle", className)}>{children}</span>;
}

/**
 * The card a section's visual lives in, built like the capability flow card:
 * a mono header (index and name rolling over as they change), the drawing on
 * a faint dot grid, then an optional footer and a row of progress segments.
 */
export function StageCard({
  index,
  title,
  aside,
  footer,
  segments,
  className,
  bodyClassName,
  children,
}: {
  index?: string;
  /** A string, so the header can roll when it changes. */
  title: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  segments?: { count: number; lit: number };
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("tokens-dark panel isolate overflow-hidden rounded-[28px] text-fg", className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
        style={{ backgroundImage: "radial-gradient(oklch(1 0 0 / 0.11) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <div className="flex items-center justify-between gap-4 px-6 pt-5 md:px-7">
        <Caption className="flex min-w-0 items-center gap-3">
          {index && <span className="tabular-nums text-fg">{index}</span>}
          <span className="relative block h-[1.2em] min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={title}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="block truncate text-fg"
              >
                {title}
              </motion.span>
            </AnimatePresence>
          </span>
        </Caption>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      <div className={cn("relative px-3 pb-3 pt-3 md:px-4", bodyClassName)}>{children}</div>
      {footer && <div className="px-6 pb-4 md:px-7">{footer}</div>}
      {segments && (
        <div aria-hidden className="flex gap-1.5 px-6 pb-5 md:px-7">
          {Array.from({ length: segments.count }, (_, i) => (
            <span key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-fg/15">
              <motion.span
                className="absolute inset-0 origin-left rounded-full bg-fg"
                initial={false}
                animate={{ scaleX: i < segments.lit ? 1 : 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export type RailItem<K extends string> = { key: K; title: React.ReactNode; body?: React.ReactNode };

/**
 * The capability-style index: a rail that fills to the chosen line, mono
 * numbers, and the chosen title set large with its words opening under it.
 */
export function RailList<K extends string>({
  items,
  value,
  onChange,
  label,
  panelId,
  start = 0,
  compact,
  shortHide,
}: {
  items: readonly RailItem<K>[];
  /** The chosen key, or null when the choice sits in another list. */
  value: K | null;
  onChange: (k: K) => void;
  label: string;
  panelId?: string;
  /** Where numbering starts, for a list split into groups. */
  start?: number;
  compact?: boolean;
  /** Drop the opened words on short desktop screens, where the list shares one screen with a card. */
  shortHide?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = items.findIndex((i) => i.key === value);
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (Math.max(0, at) + d + items.length) % items.length;
    onChange(items[n].key);
    refs.current[n]?.focus();
  };
  return (
    <div className="relative pl-6">
      <div aria-hidden className="absolute bottom-3 left-0 top-3 w-px bg-line">
        <motion.div
          className="h-full origin-top bg-fg"
          initial={false}
          animate={{ scaleY: at < 0 ? 0 : (at + 1) / items.length }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>
      <ol role="tablist" aria-label={label} aria-orientation="vertical" onKeyDown={onKey} className="flex flex-col">
        {items.map((it, i) => {
          const on = it.key === value;
          return (
            <li key={it.key}>
              <button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={panelId}
                tabIndex={on || (at < 0 && i === 0) ? 0 : -1}
                onClick={() => onChange(it.key)}
                className={cn(
                  "group grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-baseline text-left",
                  compact ? "py-2 [@media(max-height:820px)]:py-1.5" : "py-3 [@media(max-height:800px)]:py-2"
                )}
              >
                <span className={cn("font-mono text-[0.8125rem] tabular-nums transition-colors duration-500", on ? "text-fg" : "text-fg-subtle/60")}>
                  {String(start + i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "font-display block leading-[1.05] tracking-[-0.035em] transition-[color,font-size] duration-500 ease-[var(--ease-out-expo)] [font-stretch:106%]",
                      on
                        ? compact
                          ? "text-[clamp(1.375rem,0.95rem+0.7vw,1.75rem)] font-[440] text-fg"
                          : "text-[clamp(1.6rem,0.9rem+1.1vw,2.125rem)] font-[440] text-fg"
                        : "text-[1.1875rem] font-[440] text-fg-subtle/70 group-hover:text-fg-muted"
                    )}
                  >
                    {it.title}
                  </span>
                  <AnimatePresence initial={false}>
                    {on && it.body && (
                      <motion.span
                        key="body"
                        initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                        animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                        exit={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className={cn("block overflow-hidden", shortHide && "[@media(min-width:1024px)_and_(max-height:820px)]:hidden")}
                      >
                        <span className="block max-w-[46ch] pt-3 text-[1rem] leading-relaxed text-fg-muted">{it.body}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
