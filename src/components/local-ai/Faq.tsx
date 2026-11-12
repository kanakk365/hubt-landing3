import React from "react";
import { SectionIntro } from "@/components/ai2/SectionIntro";
import { Reveal } from "@/components/site/Reveal";
import { FAQ } from "@/lib/localAi";

/** The board's and the CISO's questions, each ruled off with its answer beside it. */
export function Faq() {
  return (
    <section id="faq" data-nav-tone="dark" aria-labelledby="faq-title" className="tone-dark scroll-mt-[120px]">
      <div className="container-site py-24 md:py-36">
        <SectionIntro id="faq-title" title={["Board and CISO questions,", "answered plainly."]} />
        <dl className="mt-12 border-t border-line md:mt-16">
          {FAQ.map((f) => (
            <Reveal key={f.q} className="grid gap-4 border-b border-line py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14 md:py-10">
              <dt>
                <span className="font-display text-[1.375rem] font-[440] leading-snug tracking-[-0.025em] text-fg [font-stretch:104%] md:text-[1.5rem]">
                  {f.q}
                </span>
                <span className="mt-4 block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-subtle">{f.tag}</span>
              </dt>
              <dd className="text-[1rem] leading-relaxed text-fg-muted">{f.a}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
