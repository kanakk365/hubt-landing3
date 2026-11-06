"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ArrowDownRight } from "lucide-react";
import React from "react";
import { PRODUCTS } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The six products as a printed index. Pointing at a row (or tabbing to it) brings it
 * forward and lets the other rows fall back; nothing moves over the list itself. The
 * screens live in the reel above, so the index stays type only.
 */
export function ProductIndex() {
  const reduce = !!useReducedMotion();

  return (
    <section id="index" data-nav-tone="light" aria-labelledby="index-title" className="tone-light relative">
      <div className="container-site pb-16 pt-16 md:pb-20 md:pt-24">
        <motion.h2
          id="index-title"
          initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="font-display max-w-[16ch] text-[clamp(2rem,1.15rem+2.3vw,3.3rem)] font-[460] leading-[1.04] tracking-[-0.036em] text-fg [font-stretch:104%]"
        >
          Pick one, or scroll through all six.
        </motion.h2>

        <ul className="group/list relative mt-14 md:mt-20">
          {PRODUCTS.map((p, i) => (
            <Row key={p.slug} index={i} product={p} reduce={reduce} />
          ))}
          <motion.li
            aria-hidden
            className="h-px origin-left bg-line-strong"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE, delay: PRODUCTS.length * 0.07 }}
          />
        </ul>
      </div>
    </section>
  );
}

function Row({ index, product, reduce }: { index: number; product: (typeof PRODUCTS)[number]; reduce: boolean }) {
  return (
    <motion.li
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      className={cn(
        "relative transition-opacity duration-500 ease-[var(--ease-out-expo)]",
        // The rest of the list falls back while one row is pointed at or focused.
        "group-hover/list:[&:not(:hover)]:opacity-40",
        "group-has-[a:focus-visible]/list:[&:not(:has(a:focus-visible))]:opacity-40"
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left bg-line-strong"
        variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
        transition={{ duration: 1.1, ease: EASE, delay: index * 0.07 }}
      />
      <a
        href={`#${product.slug}`}
        className="group relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-4 px-1 py-6 outline-offset-[-2px] md:grid-cols-[3.5rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] md:gap-8 md:px-4 md:py-8"
      >
        <span className="font-mono text-[0.75rem] tabular-nums text-fg-subtle transition-colors duration-300 group-hover:text-fg group-focus-visible:text-fg">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="font-display block text-[clamp(1.875rem,1rem+2.6vw,3.6rem)] font-[440] leading-[1] tracking-[-0.04em] text-fg [font-stretch:106%]"
              variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.08 + index * 0.07 }}
            >
              <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-focus-visible:translate-x-2">
                {product.name}
              </span>
            </motion.span>
          </span>
          {/* On phones the summary column is hidden, so the category travels with the name. */}
          <span className="mt-1.5 block text-[0.875rem] text-fg-muted md:hidden">{product.kind ?? product.category}</span>
        </span>
        <motion.span
          className="hidden flex-col gap-1 md:flex"
          variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.16 + index * 0.07 }}
        >
          <span className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-fg">{product.kind ?? product.category}</span>
          <span className="line-clamp-2 text-[0.875rem] leading-relaxed text-fg-muted">{product.summary}</span>
        </motion.span>
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-fg transition-[background-color,color,border-color] duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg group-focus-visible:border-fg group-focus-visible:bg-fg group-focus-visible:text-bg md:size-12">
          <ArrowDownRight className="size-[18px] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45 group-focus-visible:-rotate-45" />
        </span>
      </a>
    </motion.li>
  );
}
