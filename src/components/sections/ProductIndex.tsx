"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ArrowDownRight } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { leadShot, PRODUCTS } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { ProductFrame } from "@/components/site/ProductFrame";

const EASE = [0.22, 1, 0.36, 1] as const;
const PREVIEW_W = 300;

/**
 * The six products as a printed index on white. Each row fills black from
 * below on hover, and on wide screens a small framed preview of that product
 * follows the pointer.
 */
export function ProductIndex() {
  const reduce = !!useReducedMotion();
  const fine = useMedia("(hover: hover) and (min-width: 1024px)", false);
  const list = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 260, damping: 28, mass: 0.5 });
  const y = useSpring(py, { stiffness: 260, damping: 28, mass: 0.5 });

  const onMove = (e: React.PointerEvent) => {
    const el = list.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set(Math.min(r.width - PREVIEW_W, Math.max(0, e.clientX - r.left - PREVIEW_W / 2)));
    const row = (e.target as HTMLElement).closest("li");
    if (row && row.parentElement === el) {
      const box = row.getBoundingClientRect();
      py.set(row === el.firstElementChild ? box.bottom - r.top + 14 : box.top - r.top);
    }
  };

  return (
    <section id="index" data-nav-tone="light" aria-labelledby="index-title" className="tone-light relative">
      <div className="container-site pb-16 pt-16 md:pb-20 md:pt-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
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
        </div>

        <ul
          ref={list}
          onPointerMove={fine ? onMove : undefined}
          onPointerLeave={() => setHover(null)}
          className="relative mt-14 md:mt-20"
        >
          {PRODUCTS.map((p, i) => (
            <Row key={p.slug} index={i} product={p} reduce={reduce} onEnter={() => setHover(i)} />
          ))}
          <motion.li
            aria-hidden
            className="h-px origin-left bg-line-strong"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE, delay: PRODUCTS.length * 0.07 }}
          />

          {fine && !reduce && (
            <motion.li aria-hidden className="pointer-events-none absolute left-0 top-0 z-20" style={{ x, y, width: PREVIEW_W }}>
              <AnimatePresence>
                {hover !== null && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={hover === 0 ? undefined : "-translate-y-[calc(100%+14px)]"}
                  >
                    <ProductFrame label={PRODUCTS[hover].name} glow={false} demo={false} screenClassName="aspect-[5/4]">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={PRODUCTS[hover].slug}
                          className="absolute inset-0"
                          initial={{ clipPath: "inset(100% 0 0 0)" }}
                          animate={{ clipPath: "inset(0% 0 0 0)" }}
                          exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.3 } }}
                          transition={{ duration: 0.55, ease: EASE }}
                        >
                          <PreviewShot product={PRODUCTS[hover]} />
                        </motion.div>
                      </AnimatePresence>
                    </ProductFrame>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )}
        </ul>
      </div>
    </section>
  );
}

function Row({
  index,
  product,
  reduce,
  onEnter,
}: {
  index: number;
  product: (typeof PRODUCTS)[number];
  reduce: boolean;
  onEnter: () => void;
}) {
  return (
    <motion.li
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      className="relative"
      onPointerEnter={onEnter}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-px origin-left bg-line-strong"
        variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
        transition={{ duration: 1.1, ease: EASE, delay: index * 0.07 }}
      />
      <a
        href={`#${product.slug}`}
        className="group relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden px-1 py-6 md:grid-cols-[3.5rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] md:gap-8 md:px-4 md:py-8"
      >
        {/* Black fill rising from the bottom edge */}
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 bg-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
        />
        <span className="relative font-mono text-[0.75rem] tabular-nums text-fg-subtle transition-colors duration-300 group-hover:text-bg/60 group-focus-visible:text-bg/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="relative min-w-0">
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="font-display block text-[clamp(1.875rem,1rem+2.6vw,3.6rem)] font-[440] leading-[1] tracking-[-0.04em] text-fg transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] [font-stretch:106%] group-hover:translate-x-2 group-hover:text-bg group-focus-visible:translate-x-2 group-focus-visible:text-bg"
              variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.08 + index * 0.07 }}
            >
              {product.name}
            </motion.span>
          </span>
          {/* On phones the summary column is hidden, so the category travels with the name. */}
          <span className="mt-1.5 block text-[0.875rem] text-fg-muted transition-colors duration-300 group-hover:text-bg/65 group-focus-visible:text-bg/65 md:hidden">
            {product.kind ?? product.category}
          </span>
        </span>
        <motion.span
          className="relative hidden flex-col gap-1 md:flex"
          variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.16 + index * 0.07 }}
        >
          <span className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-fg transition-colors duration-300 group-hover:text-bg group-focus-visible:text-bg">
            {product.kind ?? product.category}
          </span>
          <span className="line-clamp-2 text-[0.875rem] leading-relaxed text-fg-muted transition-colors duration-300 group-hover:text-bg/65 group-focus-visible:text-bg/65">
            {product.summary}
          </span>
        </motion.span>
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-fg transition-[background-color,color,border-color] duration-300 group-hover:border-bg/30 group-hover:bg-bg group-hover:text-fg group-focus-visible:border-bg/30 group-focus-visible:bg-bg group-focus-visible:text-fg md:size-12">
          <ArrowDownRight className="size-[18px] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45 group-focus-visible:-rotate-45" />
        </span>
      </a>
    </motion.li>
  );
}

/** The hovered product's lead screenshot, for the pointer preview. */
function PreviewShot({ product }: { product: (typeof PRODUCTS)[number] }) {
  const shot = leadShot(product);
  if (!shot) return null;
  return <Image src={shot.src} alt="" fill sizes="340px" className="object-cover object-top" />;
}
