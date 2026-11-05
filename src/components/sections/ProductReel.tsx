"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { leadShot, PRODUCTS } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { ProductFrame } from "@/components/site/ProductFrame";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Scroll progress over which the reel travels its full width: it finishes while the whole row is still in view. */
const FROM = 0.2;
const TO = 0.6;

/**
 * Under the products hero: a real screen from each of the six, on one row. On wide
 * screens it rises in tilted back like a table of screens, then lies flat and drifts
 * left as the page scrolls, far enough to bring the last product fully into view.
 * On narrow screens, and under reduced motion, it is a row you swipe, with snap points.
 */
export function ProductReel() {
  const reduce = !!useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const glides = wide && !reduce;

  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const travel = useRef(0);

  // How far the row must move for its last card to reach the right edge.
  useEffect(() => {
    const box = ref.current;
    const ul = track.current;
    if (!box || !ul) return;
    const measure = () => {
      travel.current = Math.max(0, ul.scrollWidth - box.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(ul);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glide = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5, restDelta: 0.0001 });
  const x = useTransform(glide, (v) => -travel.current * Math.min(1, Math.max(0, (v - FROM) / (TO - FROM))));
  const rotateX = useTransform(glide, [0.15, 0.55], [18, 0]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative mt-16 md:mt-24",
        glides
          ? "[perspective:1400px]"
          : "snap-x snap-mandatory overflow-x-auto scroll-px-[var(--edge)] pb-4 [scrollbar-color:var(--color-line-strong)_transparent] [scrollbar-width:thin]"
      )}
    >
      <motion.ul
        ref={track}
        style={glides ? { x, rotateX } : undefined}
        className={cn("flex w-max gap-4 pl-[var(--edge)] pr-[var(--edge)] md:gap-6", glides && "origin-top will-change-transform")}
        aria-label="The six products"
        // While it drifts, the reel is a visual preview: the index below carries the same links
        // for keyboard and screen-reader users, so focus never lands on a card that is off screen.
        aria-hidden={glides || undefined}
      >
        {PRODUCTS.map((p, i) => {
          const shot = leadShot(p);
          return (
            <motion.li
              key={p.slug}
              initial={reduce ? false : { opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.55 + i * 0.08 }}
              className="w-[min(74vw,400px)] snap-start"
            >
              <a
                href={`#${p.slug}`}
                tabIndex={glides ? -1 : undefined}
                onFocus={glides ? undefined : (e) => e.currentTarget.parentElement?.scrollIntoView({ inline: "start", block: "nearest" })}
                className="group block"
              >
                <div className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-2">
                  <ProductFrame label={p.name} glow={false} demo={false} screenClassName="aspect-[5/4]">
                    {shot && (
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        sizes="400px"
                        priority={i < 3}
                        className="object-cover object-top"
                      />
                    )}
                  </ProductFrame>
                </div>
                <span className="mt-4 flex items-baseline gap-3 px-1">
                  <span className="font-mono text-[0.75rem] tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate text-[0.875rem] text-fg-muted transition-colors duration-300 group-hover:text-fg">
                    {p.kind ?? p.category}
                  </span>
                </span>
              </a>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
