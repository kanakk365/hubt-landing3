"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import React, { useRef } from "react";
import { SectionHeading, TextLink } from "@/components/site/SectionHeading";
import { ANATOMY } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * HubTech's AI stance as a stack: the model is one layer of six. The layers
 * settle from the foundation up as the section scrolls past.
 */
export function AiLayers() {
  const reduce = !!useReducedMotion();
  const stack = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: stack, offset: ["start 0.9", "end 0.55"] });

  return (
    <section id="ai" data-nav-tone="dark" aria-labelledby="ai-title" className="tone-dark">
      <div className="container-site grid gap-14 py-24 md:py-36 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="flex flex-col items-start gap-8 lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="ai-title"
            title={
              <>
                A model is one layer. <span className="text-fg-subtle">We build all six.</span>
              </>
            }
            lede="A demo needs a model. A system your business can rely on also needs the data it may see, the tools it can reach, the actions it is allowed to take, and proof that it was right and still is."
          />
          <TextLink href="/ai">How we build AI</TextLink>
        </div>

        {/* Foundation first in reading order; drawn bottom-up */}
        <ol ref={stack} className="flex flex-col-reverse gap-2.5" aria-label="The six layers of a production AI system">
          {ANATOMY.map((layer, i) => (
            <Layer
              key={layer.title}
              index={i}
              total={ANATOMY.length}
              title={layer.title}
              description={layer.description}
              progress={scrollYProgress}
              still={reduce}
              model={layer.title === "Model"}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Layer({
  index,
  total,
  title,
  description,
  progress,
  still,
  model,
}: {
  index: number;
  total: number;
  title: string;
  description: string;
  progress: MotionValue<number>;
  still: boolean;
  model: boolean;
}) {
  const start = (index / total) * 0.75;
  const range = [start, start + 0.28];
  const y = useTransform(progress, range, [56, 0]);
  const opacity = useTransform(progress, range, [0, 1]);
  const scale = useTransform(progress, range, [0.96, 1]);

  return (
    <motion.li
      style={still ? undefined : { y, opacity, scale }}
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-1.5 rounded-[16px] border px-6 py-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-baseline md:px-7 md:py-6",
        model ? "border-transparent bg-fg text-bg" : "border-line-strong text-fg"
      )}
    >
      <span className="flex items-baseline gap-4">
        <span className={cn("font-mono text-[0.6875rem] tabular-nums", model ? "text-bg/55" : "text-fg-subtle")}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-display text-[1.375rem] font-[480] tracking-[-0.03em] [font-stretch:104%] md:text-[1.5rem]">
          {title}
        </span>
      </span>
      <span className={cn("text-[0.9375rem] leading-relaxed sm:pl-0", model ? "text-bg/70" : "text-fg-muted")}>
        {description}
        {model && <span className="text-bg"> The only layer a demo shows.</span>}
      </span>
    </motion.li>
  );
}
