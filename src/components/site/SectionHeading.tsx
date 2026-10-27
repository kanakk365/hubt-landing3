import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  lede,
  align = "left",
  className,
  id,
  action,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        action && align === "left" && "md:flex-row md:items-end md:justify-between md:gap-12",
        className
      )}
    >
      <div className={cn("flex flex-col gap-5", align === "center" && "items-center")}>
        <h2 id={id} className="text-heading max-w-[24ch] text-fg">
          {title}
        </h2>
        {lede && (
          <p className="max-w-[60ch] text-[1.0625rem] leading-relaxed text-fg-muted md:text-lg">
            {lede}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-fg transition-colors hover:text-signal",
        className
      )}
    >
      {children}
      <ArrowRight
        aria-hidden
        className="size-4 text-signal transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
      />
    </Link>
  );
}
