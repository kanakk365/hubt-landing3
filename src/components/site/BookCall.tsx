"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { BOOKING } from "@/lib/site";
import { cn } from "@/lib/utils";

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, (...args: unknown[]) => void>;
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

export interface BookingPrefill {
  name?: string;
  email?: string;
  notes?: string;
}

/**
 * Opens the cal.com booking modal when the embed is ready, otherwise lets the
 * link open cal.com in a new tab. Works with JavaScript off.
 */
export function openBooking(prefill?: BookingPrefill): boolean {
  const api = typeof window !== "undefined" ? window.Cal?.ns?.[BOOKING.namespace] : undefined;
  if (!api) return false;
  api("modal", {
    calLink: BOOKING.link,
    config: { layout: "month_view", theme: "dark", ...prefill },
  });
  return true;
}

export function bookingUrl(prefill?: BookingPrefill) {
  const url = new URL(BOOKING.url);
  if (prefill?.name) url.searchParams.set("name", prefill.name);
  if (prefill?.email) url.searchParams.set("email", prefill.email);
  if (prefill?.notes) url.searchParams.set("notes", prefill.notes);
  return url.toString();
}

const SIZES = {
  sm: { root: "h-9 gap-2 pl-4 pr-1 text-[0.8125rem]", chip: "size-7" },
  md: { root: "h-11 gap-2.5 pl-5 pr-1.5 text-[0.9375rem]", chip: "size-8" },
  lg: { root: "h-[3.25rem] gap-3 pl-6 pr-1.5 text-[0.9375rem]", chip: "size-10" },
} as const;

/** Pill with an inset arrow chip. Primary is the only solid light on the page. */
export function PillChip({
  size,
  variant,
  className,
  children,
}: {
  size: keyof typeof SIZES;
  variant: "primary" | "ghost";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "group/pill inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] transition-[background-color,box-shadow,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]",
        SIZES[size].root,
        variant === "primary"
          ? "bg-fg text-bg shadow-[0_10px_34px_-10px_var(--pill-glow),inset_0_-1px_0_oklch(0_0_0/0.12)] group-hover:bg-[var(--pill-hover-bg)] group-hover:shadow-[0_12px_44px_-8px_var(--pill-glow-hover)]"
          : "border border-line-strong bg-fg/[0.035] text-fg backdrop-blur-md group-hover:border-fg/25 group-hover:bg-fg/[0.07]",
        className
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45",
          SIZES[size].chip,
          variant === "primary" ? "bg-bg text-fg" : "bg-fg/10 text-fg"
        )}
      >
        <ArrowUpRight className="size-[15px]" strokeWidth={2} />
      </span>
    </span>
  );
}

export function BookCall({
  children = "Book a call",
  variant = "primary",
  size = "md",
  className,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "ghost" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
  showArrow?: boolean;
}) {
  return (
    <a
      href={BOOKING.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (openBooking()) e.preventDefault();
      }}
      className={cn("group inline-flex rounded-full", className)}
    >
      <PillChip size={variant === "compact" ? "sm" : size} variant={variant === "ghost" ? "ghost" : "primary"} className="w-full">
        {children}
      </PillChip>
    </a>
  );
}
