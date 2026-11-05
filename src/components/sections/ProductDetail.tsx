"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { PRODUCT_PAGES, shotsOf, type Product } from "@/lib/site";
import { TextLink } from "@/components/site/SectionHeading";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { ProductFrame } from "@/components/site/ProductFrame";

const EASE = [0.22, 1, 0.36, 1] as const;

/** One real screenshot of the product, with the feature it shows. */
type View = ReturnType<typeof shotsOf>[number];

/** Every real screenshot the product has (or its cover). */
const viewsOf = (product: Product): View[] => shotsOf(product);
const metaOf = (v: View) => v.label;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** How far view i has wiped in (0 to 1) when the stepper reads `s`. */
const landed = (i: number, s: number) => (i === 0 ? 1 : inOut(clamp((s - (i - 1) - 0.15) / 0.7, 0, 1)));

/**
 * One product. On wide screens a product with real screenshots pins: the page
 * stops and each scroll step wipes the next screen up over the last, while the
 * list beside it follows. Everywhere else it is a plain block whose frame opens
 * as it arrives, with tabs for the screens.
 */
export function ProductDetail({ product, index }: { product: Product; index: number; total: number }) {
  const reduce = !!useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const views = viewsOf(product);
  const pinned = wide && !reduce && views.length > 1;
  const dark = index % 2 === 0;
  const flip = index % 2 === 1;

  const props = { product, views, dark, flip };
  return pinned ? <PinnedDetail {...props} /> : <StaticDetail {...props} reduce={reduce} wide={wide} />;
}

type DetailProps = { product: Product; views: View[]; dark: boolean; flip: boolean };

/* ── Pinned ─────────────────────────────────────────────────────────────── */

function PinnedDetail({ product, views, dark, flip }: DetailProps) {
  const section = useRef<HTMLElement>(null);
  const n = views.length;
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const glide = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.0001 });
  const s = useTransform(glide, [0.1, 0.9], [0, n - 1], { clamp: true });
  useMotionValueEvent(s, "change", (v) => {
    const next = clamp(Math.round(v), 0, n - 1);
    setActive((a) => (a === next ? a : next));
  });

  // The frame tilts up off the page as the section arrives.
  const { scrollYProgress: arrive } = useScroll({ target: section, offset: ["start end", "start start"] });
  const enter = useSpring(arrive, { stiffness: 110, damping: 26, mass: 0.45, restDelta: 0.0001 });
  const rotateX = useTransform(enter, [0, 1], [22, 0]);
  const y = useTransform(enter, [0, 1], [48, 0]);
  const scale = useTransform(enter, [0, 1], [0.94, 1]);

  // As the section's end passes, its content fades and lifts, so the hand-off isn't a dead band.
  const { scrollYProgress: leave } = useScroll({ target: section, offset: ["end end", "end start"] });
  const leaveOpacity = useTransform(leave, [0, 0.55], [1, 0.2]);
  const leaveY = useTransform(leave, [0, 1], [0, -60]);

  /** Scroll the window to the point where view i sits fully in place. */
  const go = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (0.1 + (i / (n - 1)) * 0.8) * range + 2, behavior: "smooth" });
  };

  const view = views[active];

  return (
    <section
      ref={section}
      id={product.slug}
      data-nav-tone={dark ? "dark" : "light"}
      aria-labelledby={`${product.slug}-title`}
      tabIndex={-1}
      data-pinned=""
      className={cn(dark ? "tone-dark" : "tone-light", "relative border-t border-line outline-none [[data-pinned]+&]:-mt-[15vh]")}
      style={{ height: `${100 + (n - 1) * 45 + 15}vh` }}
    >
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-[120px]">
        <motion.div
          style={{ opacity: leaveOpacity, y: leaveY }}
          className={cn(
            "container-site grid min-h-0 flex-1 items-center gap-12 pb-8 xl:gap-20",
            flip ? "grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]" : "grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          )}
        >
          <div className={cn("min-w-0", flip && "order-2")}>
            <DetailCopy product={product} compact />
            <Stepper views={views} active={active} s={s} onPick={go} slug={product.slug} />
            <AlsoBuilt features={product.features} compact />
          </div>

          <div className={cn("relative min-w-0 [perspective:1600px]", flip && "order-1")}>
            <motion.div style={{ rotateX, y, scale }} className="mx-auto w-full origin-bottom will-change-transform" >
              <div className="mx-auto" style={{ maxWidth: "calc((100dvh - 290px) * 1.25)" }}>
                <ProductFrame
                  label={product.name}
                  meta={<Roll value={metaOf(view)} />}
                  screenClassName="aspect-[5/4]"
                  demo={false}
                >
                  <div id={`${product.slug}-screen`} className="absolute inset-0">
                    {views.map((v, i) => (
                      <WipeLayer key={v.id} view={v} i={i} s={s} current={i === active} />
                    ))}
                  </div>
                </ProductFrame>
                <Meter n={n} active={active} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** A view inside the pinned frame: it wipes up from the bottom edge, and sinks back as the next one covers it. */
function WipeLayer({ view, i, s, current }: { view: View; i: number; s: MotionValue<number>; current: boolean }) {
  const clipPath = useTransform(s, (v) => `inset(${((1 - landed(i, v)) * 100).toFixed(3)}% 0 0 0)`);
  const scale = useTransform(s, (v) => {
    const e = landed(i, v);
    const d = landed(i + 1, v);
    return (1 + 0.12 * (1 - e)) * (1 - 0.05 * d);
  });
  const shade = useTransform(s, (v) => Math.min(0.75, landed(i + 1, v) * 0.75));
  const edgeY = useTransform(s, (v) => `${((1 - landed(i, v)) * 100).toFixed(3)}%`);
  const edgeOpacity = useTransform(s, (v) => {
    const e = landed(i, v);
    return i === 0 ? 0 : e > 0.001 && e < 0.999 ? 1 : 0;
  });

  return (
    <div className="absolute inset-0" style={{ zIndex: i }} aria-hidden={!current}>
      <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath }}>
        <motion.div className="absolute inset-0 will-change-transform" style={{ scale }}>
          <Shot view={view} sizes="(min-width: 1200px) 700px, 60vw" priority={i === 0} />
        </motion.div>
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
      </motion.div>
      {/* The lit leading edge of the wipe */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ y: edgeY, opacity: edgeOpacity }}>
        <span className="absolute inset-x-0 top-0 h-px bg-white shadow-[0_0_18px_2px_oklch(1_0_0/0.6)]" />
      </motion.div>
    </div>
  );
}

/** The views as a reading list on a rail: the one in the frame is lit and opens its line. */
function Stepper({
  views,
  active,
  s,
  onPick,
  slug,
}: {
  views: View[];
  active: number;
  s: MotionValue<number>;
  onPick: (i: number) => void;
  slug: string;
}) {
  const n = views.length;
  const fill = useTransform(s, [0, n - 1], [1 / n, 1]);
  return (
    <div className="relative mt-8 pl-6 [@media(max-height:800px)]:mt-5">
      <div aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line">
        <motion.div className="h-full origin-top bg-fg" style={{ scaleY: fill }} />
      </div>
      <ol aria-label="Screens" className="flex flex-col" style={{ minHeight: `calc(${n} * 2.4rem + 5.25rem)` }}>
        {views.map((v, i) => {
          const on = i === active;
          const done = i < active;
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-controls={`${slug}-screen`}
                aria-current={on ? "step" : undefined}
                className="group grid w-full grid-cols-[2.25rem_minmax(0,1fr)] items-baseline py-[0.45rem] text-left"
              >
                <span
                  className={cn(
                    "font-mono text-[0.75rem] tabular-nums transition-colors duration-500",
                    on ? "text-fg" : "text-fg-subtle"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)]",
                      on ? "translate-x-1 text-fg" : done ? "text-fg-muted" : "text-fg-subtle group-hover:text-fg-muted"
                    )}
                  >
                    {v.label}
                  </span>
                  <AnimatePresence initial={false}>
                    {on && v.description && (
                      <motion.span
                        key="d"
                        initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                        animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                        exit={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="block overflow-hidden"
                      >
                        <span className="block max-w-[42ch] pb-1 pt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                          {v.description}
                        </span>
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

/** Under the frame: a rolling count of the screens. */
function Meter({ n, active }: { n: number; active: number }) {
  return (
    <div className="mt-4 flex items-center justify-end font-mono text-[0.75rem] text-fg-subtle">
      <span className="flex items-baseline gap-1.5 tabular-nums">
        <Roll value={String(active + 1).padStart(2, "0")} className="text-fg" />
        <span>/ {String(n).padStart(2, "0")}</span>
      </span>
    </div>
  );
}

/** Text that rolls up to its new value. */
function Roll({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden align-bottom", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="block whitespace-nowrap"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Copy shared by both layouts ────────────────────────────────────────── */

function DetailCopy({ product, compact }: { product: Product; compact?: boolean }) {
  const reduce = !!useReducedMotion();
  return (
    <div>
      {/* The observer sits on the heading: the masked line starts outside its clip, so it can't watch itself. */}
      <motion.h2
        id={`${product.slug}-title`}
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={{ once: true, amount: 0.6 }}
        className={cn(
          "font-display font-[440] tracking-[-0.045em] text-fg [font-stretch:108%]",
          compact
            ? "text-[clamp(2.5rem,1rem+3.2vw,4.25rem)] [@media(max-height:800px)]:text-[clamp(2.25rem,1rem+2.6vw,3.5rem)]"
            : "text-[clamp(2.5rem,1rem+4vw,4.75rem)]",
          // After the size: cn() drops a line-height that comes before a font size.
          "leading-[0.98]"
        )}
      >
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "108%" }, shown: { y: "0%" } }}
            transition={{ duration: 1, ease: EASE }}
          >
            {product.name}
          </motion.span>
        </span>
      </motion.h2>

      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className={cn("mt-3 text-[1.0625rem] font-medium tracking-[-0.01em] text-fg-subtle", compact && "[@media(max-height:800px)]:mt-2")}
      >
        {product.kind ?? product.category}
      </motion.p>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className={cn(
          "mt-5 max-w-[52ch] text-fg-muted",
          compact ? "text-[1rem] [@media(max-height:800px)]:mt-3 [@media(max-height:800px)]:text-[0.9375rem]" : "text-[1.0625rem]",
          "leading-relaxed"
        )}
      >
        {product.description}
      </motion.p>

      <ul className={cn("mt-5 flex flex-wrap gap-2", compact && "[@media(max-height:800px)]:hidden")}>
        {product.addedTags.map((t, i) => (
          <motion.li
            key={t}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 + i * 0.06 }}
            className="rounded-full border border-line px-3 py-1 text-[0.8125rem] font-medium text-fg-muted"
          >
            {t}
          </motion.li>
        ))}
      </ul>

      {PRODUCT_PAGES.has(product.slug) && (
        <TextLink href={`/products/${product.slug}`} className="mt-5 py-1">
          Open the {product.name} page
        </TextLink>
      )}
    </div>
  );
}

/* ── Static ─────────────────────────────────────────────────────────────── */

function StaticDetail({ product, views, dark, flip, reduce, wide }: DetailProps & { reduce: boolean; wide: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const view = views[active];

  // The frame opens from a narrow, tilted card to full size as it arrives.
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "center center"] });
  const open = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.45, restDelta: 0.0001 });
  const clipPath = useTransform(open, (v) => {
    const k = 1 - v;
    return `inset(${(k * 10).toFixed(2)}% ${(k * 12).toFixed(2)}% ${(k * 10).toFixed(2)}% ${(k * 12).toFixed(2)}% round ${(18 + k * 30).toFixed(1)}px)`;
  });
  const rotateX = useTransform(open, [0, 1], [14, 0]);
  const inner = useTransform(open, [0, 1], [1.12, 1]);

  return (
    <section
      id={product.slug}
      data-nav-tone={dark ? "dark" : "light"}
      aria-labelledby={`${product.slug}-title`}
      tabIndex={-1}
      className={cn(dark ? "tone-dark" : "tone-light", "relative scroll-mt-12 overflow-hidden border-t border-line pb-24 pt-24 outline-none md:pb-32 md:pt-32 [[data-pinned]+&]:-mt-[15vh]")}
    >
      <div
        className={cn(
          "container-site grid grid-cols-1 items-center gap-12 lg:gap-20",
          flip ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]" : "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
        )}
      >
        <div className={cn("min-w-0", flip && "lg:order-2")}>
          <DetailCopy product={product} />
          {/* On narrow screens the tabs sit under the frame they switch. */}
          {views.length > 1 ? (
            <>
              {wide && <Tabs views={views} active={active} onPick={setActive} slug={product.slug} />}
              {wide && <AlsoBuilt features={product.features} />}
            </>
          ) : (
            <FeatureList features={product.features} reduce={reduce} />
          )}
        </div>

        <div ref={frame} className={cn("min-w-0 [perspective:1600px]", flip && "lg:order-1")}>
          <motion.div style={reduce ? undefined : { clipPath, rotateX }} className="origin-bottom">
            <ProductFrame label={product.name} meta={<Roll value={metaOf(view)} />} screenClassName="aspect-[5/4]" demo={false}>
              <motion.div
                id={`${product.slug}-screen`}
                role={views.length > 1 ? "tabpanel" : undefined}
                aria-labelledby={views.length > 1 ? `${product.slug}-tab-${active}` : undefined}
                className="absolute inset-0"
                style={reduce ? undefined : { scale: inner }}
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={view.id}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(100% 0 0 0)", zIndex: 1 }}
                    animate={{ clipPath: "inset(0% 0 0 0)", zIndex: 1 }}
                    exit={{ opacity: 0, zIndex: 0, transition: { opacity: { duration: 0.4, delay: 0.35 }, zIndex: { duration: 0 } } }}
                    transition={{ duration: 0.75, ease: EASE }}
                  >
                    <Shot view={view} sizes="(min-width: 1200px) 700px, (min-width: 1024px) 60vw, 100vw" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </ProductFrame>
          </motion.div>

          {views.length > 1 && !wide && <Tabs views={views} active={active} onPick={setActive} slug={product.slug} />}
          {views.length > 1 && !wide && <AlsoBuilt features={product.features} />}

          {views.length > 1 && wide && (
            <div className="mt-5 flex items-center gap-4">
              <span className="shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-fg-subtle">Screens</span>
              <ul className="flex min-w-0 gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {views.map((v, idx) => {
                  const selected = idx === active;
                  return (
                    <li key={v.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setActive(idx)}
                        aria-label={`Show screenshot: ${v.label}`}
                        aria-pressed={selected}
                        className={cn(
                          "relative block h-[60px] w-[84px] overflow-hidden rounded-[10px] border transition-[border-color,opacity,transform] duration-300",
                          selected ? "-translate-y-0.5 border-fg opacity-100" : "border-line opacity-60 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={v.src}
                          alt=""
                          fill
                          sizes="84px"
                          className={cn("object-cover", v.position === "left" ? "object-left-top" : "object-top")}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** The views as buttons, for layouts that don't pin. */
function Tabs({ views, active, onPick, slug }: { views: View[]; active: number; onPick: (i: number) => void; slug: string }) {
  const list = useRef<HTMLDivElement>(null);
  const move = (i: number) => {
    const next = (i + views.length) % views.length;
    onPick(next);
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: views.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    move(to);
  };
  return (
    <div ref={list} role="tablist" aria-label="Screens" aria-orientation="vertical" className="mt-8 flex flex-col border-t border-line">
      {views.map((v, i) => {
        const selected = i === active;
        return (
          <button
            key={v.id}
            id={`${slug}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${slug}-screen`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onPick(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="group relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline border-b border-line py-4 text-left"
          >
            <span className={cn("font-mono text-[0.75rem] tabular-nums", selected ? "text-fg" : "text-fg-subtle")}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className={cn("block text-[1rem] font-semibold tracking-[-0.015em]", selected ? "text-fg" : "text-fg-muted group-hover:text-fg")}>
                {v.label}
              </span>
              <span
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
                  selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <span className="overflow-hidden">
                  <span className="block pt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">{v.description}</span>
                </span>
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                "absolute bottom-[-1px] left-0 h-px origin-left bg-fg transition-transform duration-700 ease-[var(--ease-out-expo)]",
                selected ? "w-full scale-x-100" : "w-full scale-x-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Features the screens don't show, named so they don't silently drop out of a product's section. */
function AlsoBuilt({ features, compact }: { features: Product["features"]; compact?: boolean }) {
  const unpictured = features.filter((f) => !f.image);
  if (!unpictured.length) return null;
  return (
    <ul className={cn("mt-6 flex flex-col gap-2 border-t border-line pt-5", compact && "[@media(max-height:760px)]:hidden")}>
      {unpictured.map((f) => (
        <li key={f.id} className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-fg-muted">
          <span className="font-semibold text-fg">Also built: {f.label}.</span> {f.description}
        </li>
      ))}
    </ul>
  );
}

/** Features as a ruled list whose rules draw in, one after another. */
function FeatureList({ features, reduce }: { features: Product["features"]; reduce: boolean }) {
  return (
    <ul className="mt-9 flex flex-col">
      {features.map((f, i) => (
        <motion.li
          key={f.id}
          initial={reduce ? false : "hidden"}
          whileInView="shown"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          className="relative grid gap-1 py-4"
        >
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left bg-line-strong"
            variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
          />
          <motion.span
            className="flex items-baseline gap-3 text-[1rem] font-semibold tracking-[-0.015em] text-fg"
            variants={{ hidden: { opacity: 0, x: -12 }, shown: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.08 }}
          >
            <span className="font-mono text-[0.75rem] font-normal tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
            {f.label}
          </motion.span>
          <motion.span
            className="pl-[2.1rem] text-[0.9375rem] leading-relaxed text-fg-muted"
            variants={{ hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.18 + i * 0.08 }}
          >
            {f.description}
          </motion.span>
        </motion.li>
      ))}
      <li aria-hidden className="h-px bg-line-strong" />
    </ul>
  );
}

/** A real screenshot filling the frame's screen. */
function Shot({ view, sizes, priority }: { view: View; sizes: string; priority?: boolean }) {
  return (
    <Image
      src={view.src}
      alt={view.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", view.position === "left" ? "object-left-top" : "object-top")}
    />
  );
}
