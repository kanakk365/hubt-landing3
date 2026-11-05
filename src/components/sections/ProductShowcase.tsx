"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, type MotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { PRODUCTS } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { ProductDetail } from "./ProductDetail";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Navbar (72px) plus this rail (48px): where content under both begins. */
const RAIL_BOTTOM = 120;

/**
 * The six product blocks, with a jump rail that slides in under the navbar
 * while they are on screen. The rail lights the product under the middle of
 * the viewport and draws a hairline for progress through all six.
 */
export function ProductShowcase() {
  const wrap = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<string>(PRODUCTS[0].slug);
  const [shown, setShown] = useState(false);
  // Each product swaps its pinned layout for a static one on narrow screens and under reduced
  // motion, replacing its section node; the observer has to follow those swaps.
  const wide = useMedia("(min-width: 1024px)");
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: wrap, offset: [`start ${RAIL_BOTTOM}px`, `end ${RAIL_BOTTOM}px`] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4, restDelta: 0.0001 });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v > 0 && v < 1;
    setShown((s) => (s === next ? s : next));
  });

  useEffect(() => {
    const sections = PRODUCTS.map((p) => document.getElementById(p.slug)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setCurrent(hit.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [wide, reduce]);

  // Product links land exactly, wherever they come from: the reel, the index, the rail,
  // or another page (a product page's "Next product"). They jump rather than glide: a smooth
  // scroll across the pinned chapters gets cut short and would replay every wipe on the way.
  useEffect(() => {
    const slugs = new Set(PRODUCTS.map((p) => p.slug));
    /** Scroll to a product (clearing the navbar and rail where its section asks to) and, for clicks, move focus there. */
    const land = (slug: string, focus = false) => {
      const el = document.getElementById(slug);
      if (!el) return;
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margin, behavior: "instant" });
      if (focus) el.focus({ preventScroll: true });
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const slug = a?.hash.slice(1);
      if (!slug || !slugs.has(slug)) return;
      e.preventDefault();
      // Remember where the jump started, so Back returns there rather than staying on the product.
      history.replaceState({ ...history.state, productsY: window.scrollY }, "");
      history.pushState(null, "", `#${slug}`);
      land(slug, true);
    };
    document.addEventListener("click", onClick);
    const onPop = (e: PopStateEvent) => {
      const y = (e.state as { productsY?: number } | null)?.productsY;
      if (typeof y !== "number") return;
      const restore = () => window.scrollTo({ top: y, behavior: "instant" });
      restore();
      // Restore again once the router and layout have settled after the history change.
      requestAnimationFrame(() => requestAnimationFrame(restore));
    };
    window.addEventListener("popstate", onPop);

    const fromHash = () => {
      if (typeof (history.state as { productsY?: number } | null)?.productsY === "number") return;
      const hash = window.location.hash.slice(1);
      if (slugs.has(hash)) land(hash);
    };
    let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(fromHash)));
    document.fonts?.ready.then(fromHash);
    // Back, forward and typed hashes skip the click handler; land those too.
    window.addEventListener("hashchange", fromHash);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", fromHash);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} className="relative">
      <AnimatePresence>{shown && <Rail key="rail" current={current} progress={progress} />}</AnimatePresence>
      {PRODUCTS.map((p, i) => (
        <ProductDetail key={p.slug} product={p} index={i} total={PRODUCTS.length} />
      ))}
    </div>
  );
}

function Rail({ current, progress }: { current: string; progress: MotionValue<number> }) {
  const reduce = !!useReducedMotion();
  const list = useRef<HTMLUListElement>(null);
  const index = Math.max(0, PRODUCTS.findIndex((p) => p.slug === current));

  // Keep the lit pill in view on narrow screens, where the list scrolls sideways.
  // Only the list scrolls, so a page scroll already under way is never interrupted.
  useEffect(() => {
    const ul = list.current;
    const el = ul?.querySelector<HTMLElement>(`[data-slug="${current}"]`);
    if (!ul || !el || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({ left: el.offsetLeft - (ul.clientWidth - el.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  }, [current, reduce]);

  return (
    <motion.nav
      aria-label="Products on this page"
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="tokens-dark fixed inset-x-0 top-[72px] z-40 border-b border-line bg-black text-fg"
    >
      <div className="container-site flex h-12 items-center gap-6">
        <span className="hidden shrink-0 items-baseline gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-fg-subtle md:flex">
          <span className="relative inline-flex h-[1.2em] overflow-hidden tabular-nums text-fg">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={index}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: EASE }}
                className="block"
              >
                {String(index + 1).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </span>
          / {String(PRODUCTS.length).padStart(2, "0")}
        </span>
        <ul
          ref={list}
          className="relative -mx-2 flex min-w-0 flex-1 gap-1 overflow-x-auto px-2 [scrollbar-width:none] md:justify-end [&::-webkit-scrollbar]:hidden"
        >
          {PRODUCTS.map((p) => {
            const active = p.slug === current;
            return (
              <li key={p.slug} data-slug={p.slug} className="relative shrink-0">
                <a
                  href={`#${p.slug}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "relative z-10 flex h-8 items-center rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-300",
                    active ? "text-black" : "text-fg-subtle hover:text-fg"
                  )}
                >
                  {p.name}
                </a>
                {active && (
                  <motion.span
                    layoutId="product-rail-lit"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-full bg-fg"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <motion.div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-fg" style={{ scaleX: progress }} />
    </motion.nav>
  );
}
