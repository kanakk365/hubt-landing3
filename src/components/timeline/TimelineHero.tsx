"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { BookCall } from "@/components/site/BookCall";
import { TextLink } from "@/components/site/SectionHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { DigitalRain } from "./DigitalRain";

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * The opening, set like the AI page's: the digital rain fills the frame, and
 * the claim and the call sit low over it, where the rain thins out. As the
 * page leaves, the copy lifts and clears ahead of the rain.
 */
export function TimelineHero() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const cue = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={section}
      id="timeline-top"
      data-nav-tone="dark"
      aria-labelledby="timeline-title"
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-black pt-[72px]"
    >
      <div className="relative h-full">
        {/* The rain itself thins out toward the copy, so the title always reads: higher up while the copy stacks, lower once it sits beside the lede. */}
        <DigitalRain className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_0%,#000_16%,transparent_44%)] xl:[mask-image:linear-gradient(to_bottom,#000_0%,#000_38%,transparent_70%)]" />
        {/* The light the rain throws off, strongest where it falls from. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_65%_at_50%_0%,oklch(0.5_0.13_152/0.13),transparent_70%)]"
        />
        <Frame />

        <motion.div
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
          className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-6 pb-10 pt-8 md:px-8 md:pb-14 md:pt-10"
        >
          <div className="flex items-start justify-end">
            <motion.div
              aria-hidden
              style={reduce ? undefined : { opacity: cue }}
              className="relative hidden flex-col items-end gap-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-fg-subtle lg:flex"
            >
              {/* A soft dark patch, so the rain passes behind the cue rather than through it. */}
              <span className="absolute -inset-x-10 -inset-y-6 -z-10 rounded-full bg-black/80 blur-xl" />
              Scroll from 2002
              <span className="relative h-8 w-px overflow-hidden bg-line">
                <span className="absolute inset-x-0 top-0 h-3 animate-[cue-drop_1.8s_var(--ease-out-expo)_infinite] bg-signal motion-reduce:hidden" />
              </span>
            </motion.div>
          </div>

          <div className="grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:gap-12">
            {/* Sized to its column (cqi): from 768px the second line holds on one line, so the title is two lines that
                match the copy beside it; on phones it breaks once, between "shipping what" and "had to work". */}
            <div className="@container">
              <h1
                id="timeline-title"
                className="font-display text-[clamp(2.5rem,13.4cqi,5.75rem)] font-[400] leading-[0.96] tracking-[-0.045em] text-fg [font-stretch:110%] md:text-[clamp(2.5rem,8.4cqi,5.75rem)]"
              >
                {[["Since 2002,"], ["shipping what", "had to work."]].map((parts, i) => (
                  <span key={i} className="block overflow-hidden pb-[0.08em]">
                    <motion.span
                      className={cn("block", i > 0 && "text-fg-subtle")}
                      initial={reduce ? false : { y: "108%", rotate: 2 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 1.1, ease: EXPO, delay: 0.5 + i * 0.1 }}
                    >
                      {parts.map((part, j) => (
                        <React.Fragment key={part}>
                          {j > 0 && " "}
                          <span className="whitespace-nowrap">{part}</span>
                        </React.Fragment>
                      ))}
                    </motion.span>
                  </span>
                ))}
              </h1>
            </div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: EXPO, delay: 0.85 }}
              className="flex flex-col items-start gap-5"
            >
              <p className="max-w-[46ch] text-base leading-[1.55] text-fg-muted xl:max-w-none [@media(max-height:700px)]:hidden">
                Document and biometric vaults, a 180-person studio in New York and Chennai, apps with 100MM+ downloads, a connected
                supercar, an IoT platform and youth sports. The companies behind HubTech, in order.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <BookCall size="lg" />
                <TextLink href="#now" className="px-3">
                  See what we run today
                </TextLink>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Corner marks, as on the AI page's opening. */
function Frame() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-4 md:inset-6">
      <span className="absolute left-0 top-0 size-5 border-l border-t border-line-strong" />
      <span className="absolute right-0 top-0 size-5 border-r border-t border-line-strong" />
      <span className="absolute bottom-0 left-0 size-5 border-b border-l border-line-strong" />
      <span className="absolute bottom-0 right-0 size-5 border-b border-r border-line-strong" />
    </div>
  );
}
