"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import React, { useRef } from "react";
import { TextLink } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { HOME } from "@/lib/site";

/** Who HubTech is, read word by word as it scrolls through the viewport. */
export function StudioStatement() {
  const reduce = useReducedMotion();
  const text = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: text, offset: ["start 0.85", "end 0.5"] });
  const words = HOME.statement.split(" ");

  return (
    <section id="studio" data-nav-tone="dark" aria-labelledby="studio-title" className="tone-dark scroll-mt-0">
      <div className="container-site pb-24 pt-32 md:pb-36 md:pt-44">
        <h2 id="studio-title" className="sr-only">
          About HubTech
        </h2>
        <p
          ref={text}
          className="font-display max-w-[30ch] text-[clamp(1.9rem,0.9rem+2.9vw,3.75rem)] font-[420] leading-[1.08] tracking-[-0.035em] text-fg [font-stretch:104%]"
        >
          {words.map((word, i) => (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[i / words.length, Math.min(1, (i + 2.5) / words.length)]}
              still={!!reduce}
            >
              {word}
            </Word>
          ))}
        </p>

        <div className="mt-20 grid gap-10 border-t border-line pt-10 md:mt-28 md:grid-cols-2 md:gap-16">
          <Reveal className="flex flex-col items-start gap-5">
            <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-fg-muted">
              <span className="text-fg">Six platforms shipped</span> {HOME.shipped}
            </p>
            <TextLink href="/products">See what we&apos;ve built</TextLink>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col items-start gap-5">
            <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-fg-muted">
              <span className="text-fg">We work with</span> {HOME.audiences}
            </p>
            <TextLink href="#process">How an engagement runs</TextLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  still,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <>
      <motion.span style={{ opacity: still ? 1 : opacity }}>{children}</motion.span>{" "}
    </>
  );
}
