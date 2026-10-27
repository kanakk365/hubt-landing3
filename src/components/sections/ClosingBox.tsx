"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React, { useRef } from "react";
import { BookCall } from "@/components/site/BookCall";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { InquiryForm } from "./InquiryForm";

/**
 * The page closes the way it opened: on white, a black box opens to full
 * width as it arrives, holding the booking call and the inquiry form, and runs
 * straight into the footer.
 */
export function ClosingBox({
  title = "Tell us what has to work.",
  line = "Book a call with the team that will build it.",
  lede = "Or leave a few details first. They carry over, so picking a time is the only step left.",
  balanced = true,
}: {
  /** A phrase that wraps on its own, or one entry per line (the last one quieter on the black pages). */
  title?: React.ReactNode | React.ReactNode[];
  line?: React.ReactNode;
  lede?: React.ReactNode;
  /** Stretch the words to the form's height so the call sits level with the form's button. Home keeps them stacked. */
  balanced?: boolean;
}) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: box, offset: ["start end", "start 0.2"] });
  const clipPath = useTransform(scrollYProgress, (v) => {
    const k = 1 - Math.min(1, v) ** 1.4;
    const side = (k * 6).toFixed(3);
    const r = (k * 40).toFixed(2);
    return `inset(0px ${side}vw 0px ${side}vw round ${r}px ${r}px 0px 0px)`;
  });

  return (
    <section id="contact" data-nav-tone="light" aria-labelledby="cta-title" className="tone-light scroll-mt-0">
      <div className="container-site pb-14 pt-24 md:pb-20 md:pt-36">
        <Reveal>
          <h2
            id="cta-title"
            className={cn(
              "font-display text-[clamp(2.6rem,0.9rem+5vw,6rem)] font-[420] leading-[0.96] tracking-[-0.04em] text-fg [font-stretch:106%]",
              !Array.isArray(title) && "max-w-[14ch]"
            )}
          >
            {Array.isArray(title)
              ? title.map((l, i) => (
                  <span key={i} className={cn("block", title.length > 1 && i === title.length - 1 && "text-fg-subtle bw:text-fg")}>
                    {l}
                  </span>
                ))
              : title}
          </h2>
        </Reveal>
      </div>

      <motion.div
        ref={box}
        data-nav-tone="dark"
        className="tokens-dark relative border-t border-line bg-[oklch(0.085_0_0)] text-fg bw:border-t-0 bw:bg-black"
        style={reduce ? undefined : { clipPath }}
      >
        <div className="container-site relative grid gap-14 py-20 md:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* Balanced, this spans the form's height: the words at the top, the call level with the form's own button. */}
          <div className={cn("flex flex-col items-start gap-8", balanced && "lg:justify-between")}>
            <div className="flex flex-col items-start gap-8">
              <p className="max-w-[30ch] font-display text-[clamp(1.5rem,1.1rem+1vw,2rem)] font-[440] leading-[1.15] tracking-[-0.03em] text-fg [font-stretch:104%]">
                {line}
              </p>
              <p className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-fg-muted">{lede}</p>
            </div>
            <BookCall size="lg" />
          </div>
          <div className="border-t border-line pt-12 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <InquiryForm />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
