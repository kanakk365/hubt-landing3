"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { PRODUCTS } from "@/lib/site";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const EXPO = [0.16, 1, 0.3, 1] as const;
/** Started at Hub Technology (783hz.me); the rest are HubTech's own. */
const CARRIED = new Set(["ysn", "connected-athlete", "battles-lounge"]);
/** HubTech's own first, so the frame doesn't open on a screen the Hub Technology collage just showed. */
const ORDER = ["oneplace", "rivalis", "xura", "battles-lounge", "ysn", "connected-athlete"];
const LIST = ORDER.map((slug) => PRODUCTS.find((x) => x.slug === slug)).filter((x): x is (typeof PRODUCTS)[number] => !!x);

/**
 * The last chapter has no years: it is the work running now. Each product's
 * row lights its own screen in the frame beside it, and the frame is as tall
 * as the column it stands beside. It comes in the way the History page's
 * chapters do: the words rise out of their masks, the rows follow one by one
 * and the frame tilts into place.
 */
export function NowChapter() {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(0);
  const p = LIST[lit];
  const section = useRef<HTMLElement>(null);
  const seen = useInView(section, { once: true, amount: 0.2 });
  const on = seen || reduce;
  const rise = (delay: number) => ({
    initial: reduce ? false : { y: "108%", rotate: 2 },
    animate: on ? { y: "0%", rotate: 0 } : undefined,
    transition: { duration: 1, ease: EXPO, delay },
  });
  const tilt = {
    initial: reduce ? false : { opacity: 0, y: 40, rotate: 2, scale: 0.96 },
    animate: on ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined,
    transition: { duration: 0.9, ease: EXPO, delay: 0.3 },
  } as const;

  return (
    <section ref={section} id="now" data-nav-tone="dark" aria-labelledby="now-title" className="relative scroll-mt-[72px] py-28 md:py-36">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="@container lg:col-span-5">
          <p className="font-display flex items-center gap-5 text-[clamp(2.6rem,1.3rem+6.2vw,6rem)] font-[340] leading-[0.9] tracking-[-0.04em] text-fg [font-stretch:108%]">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" {...rise(0)}>
                Now
              </motion.span>
            </span>
            <motion.span
              aria-hidden
              className="relative flex size-3.5"
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              animate={on ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.6, ease: EXPO, delay: 0.55 }}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-signal/60 motion-reduce:hidden" />
              <span className="relative size-3.5 rounded-full bg-signal" />
            </motion.span>
          </p>
          <h2
            id="now-title"
            // Sized to the column, so "The same line, still shipping." holds on one line.
            className="font-display mt-8 text-[clamp(1.5rem,7.9cqi,3rem)] font-[440] leading-[1.06] tracking-[-0.035em] text-fg [font-stretch:106%]"
          >
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" {...rise(0.12)}>
                HubTech
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block text-fg-subtle" {...rise(0.2)}>
                The same line, still shipping.
              </motion.span>
            </span>
          </h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={on ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ duration: 0.8, ease: EXPO, delay: 0.35 }}
            className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-muted"
          >
            Six platforms we build and run today. Three of them carried on from Hub Technology.
          </motion.p>

          <motion.div className="mt-10 lg:hidden" {...tilt}>
            <Preview p={p} reduce={reduce} />
          </motion.div>

          <ol className="mt-10 border-b border-line">
            {LIST.map((x, i) => (
              <motion.li
                key={x.slug}
                className="relative"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={on ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.7, ease: EXPO, delay: 0.45 + i * 0.07 }}
              >
                {/* Each row's rule draws in ahead of its name. */}
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left bg-line"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={on ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.9, ease: EXPO, delay: 0.4 + i * 0.07 }}
                />
                <button
                  type="button"
                  onMouseEnter={() => setLit(i)}
                  onFocus={() => setLit(i)}
                  onClick={() => setLit(i)}
                  aria-pressed={i === lit}
                  className="group flex w-full items-baseline justify-between gap-6 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                >
                  <span className="flex items-baseline gap-3">
                    <span
                      aria-hidden
                      className={cn("size-[7px] shrink-0 translate-y-[-1px] rounded-full transition-colors", i === lit ? "bg-signal" : "bg-fg/20")}
                    />
                    <span className={cn("text-[1.0625rem] font-medium tracking-[-0.015em] transition-colors", i === lit ? "text-fg" : "text-fg-muted group-hover:text-fg")}>
                      {x.name}
                    </span>
                  </span>
                  <span className="text-right text-[0.8125rem] text-fg-subtle">
                    {CARRIED.has(x.slug) ? "Since Hub Technology" : x.category}
                  </span>
                </button>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div className="hidden lg:col-span-7 lg:flex lg:flex-col" {...tilt}>
          <Preview p={p} reduce={reduce} fill />
        </motion.div>
      </div>
    </section>
  );
}

/** The frame that shows the lit product's screen, with its line under it. */
function Preview({ p, reduce, fill = false }: { p: (typeof PRODUCTS)[number]; reduce: boolean; fill?: boolean }) {
  return (
    <>
      <div className={cn("relative overflow-hidden rounded-[16px] border border-line bg-black", fill ? "min-h-[20rem] flex-1" : "aspect-[4/3]")}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={p.slug}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 0% 100%)", filter: "blur(6px)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : 0.7, ease: EXPO }}
          >
            {p.cover ? (
              <Image
                src={p.cover.src}
                width={p.cover.width}
                height={p.cover.height}
                alt={p.cover.alt}
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="size-full object-cover object-left-top"
              />
            ) : (
              // No screenshot on hand: the product sets its own name.
              <div className="flex size-full flex-col justify-end gap-3 bg-[oklch(0.1_0_0)] p-8 md:p-12">
                <span className="font-display text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] font-[420] leading-[0.95] tracking-[-0.04em] text-fg">
                  {p.name}
                </span>
                <span className="max-w-[40ch] text-[1rem] leading-relaxed text-fg-muted">{p.summary}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={p.slug}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: EXPO }}
          className="mt-4 min-h-[3.2em] max-w-[60ch] text-[0.9375rem] leading-relaxed text-fg-muted"
        >
          <span className="text-fg">{p.name}.</span> {p.cover ? p.summary : p.category}
        </motion.p>
      </AnimatePresence>
    </>
  );
}
