"use client";

import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import { leadShot, PRODUCTS } from "@/lib/site";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ProductFrame } from "@/components/site/ProductFrame";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Under the products hero: a real screen from each of the six, shown flat and still so
 * they read as product rather than effect. Three across on wide screens, all six in view
 * without any sideways travel; a row to swipe on narrow ones. Each card jumps to its
 * product further down.
 */
export function ProductReel() {
  const reduce = !!useReducedMotion();

  return (
    <ul
      aria-label="The six products"
      className={cn(
        "group/reel mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--edge)] px-[var(--edge)] pb-4 md:mt-24 md:gap-6",
        "[scrollbar-color:var(--color-line-strong)_transparent] [scrollbar-width:thin]",
        "lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12 lg:overflow-visible lg:pb-0"
      )}
    >
      {PRODUCTS.map((p, i) => {
        const shot = leadShot(p);
        return (
          <motion.li
            key={p.slug}
            initial={reduce ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.6 + i * 0.07 }}
            className="w-[min(78vw,400px)] shrink-0 snap-start lg:w-auto"
          >
            {/* Pointing at one screen lets the other five fall back, as the index below does. */}
            <div className="transition-opacity duration-500 ease-[var(--ease-out-expo)] group-has-[a:hover]/reel:[&:not(:has(a:hover))]:opacity-45">
              <a
                href={`#${p.slug}`}
                onFocus={(e) => e.currentTarget.parentElement?.scrollIntoView({ inline: "nearest", block: "nearest" })}
                className="group block rounded-[20px]"
              >
                <ProductFrame
                  label={p.name}
                  glow={false}
                  demo={false}
                  className="[&>div]:transition-colors [&>div]:duration-500 group-hover:[&>div]:border-line-strong"
                  screenClassName="aspect-[5/4]"
                >
                  {shot && (
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 1024px) 380px, 400px"
                      priority={i < 3}
                      className="origin-top object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                    />
                  )}
                </ProductFrame>
                <span className="mt-4 flex items-start gap-3 px-1">
                  <span className="pt-[0.2rem] font-mono text-[0.75rem] tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-fg-muted transition-colors duration-300 group-hover:text-fg">
                    {p.kind ?? p.category}
                  </span>
                  <ArrowDownRight
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-fg opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                </span>
              </a>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
