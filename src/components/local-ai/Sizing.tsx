"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useId, useState } from "react";
import { SectionIntro } from "@/components/ai2/SectionIntro";
import { PillChip, bookingUrl, openBooking } from "@/components/site/BookCall";
import { MODEL_STACK, TIERS, sizeOffice, type Tier } from "@/lib/localAi";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { Caption, EASE, RailList, StageCard } from "./kit";

const fmt = (n: number) => n.toLocaleString("en-US");
const TICKS = [25, 500, 1500, 2500];
const TIER_KEYS = Object.keys(TIERS) as Tier[];

/**
 * Size your office AI appliance: team size and compliance level on the left,
 * the turnkey spec in its card on the right. Booking carries the spec along.
 */
export function Sizing() {
  const id = useId();
  const [users, setUsers] = useState(250);
  const [tier, setTier] = useState<Tier>("regulated");
  const t = TIERS[tier];
  const { savings, server } = sizeOffice(users);
  const gpus = users <= 150 ? 2 : users <= 800 ? 4 : 8;
  const reduce = useReducedMotion();
  const shown = useMotionValue(savings);
  const money = useTransform(shown, (v) => `$${fmt(Math.round(v / 1000) * 1000)}`);
  useEffect(() => {
    const c = animate(shown, savings, { duration: reduce ? 0 : 0.8, ease: EASE });
    return () => c.stop();
  }, [savings, shown, reduce]);

  const notes = `Local AI sizing: ${fmt(users)} employees · ${t.title} · ${server} · est. 3-year savings $${fmt(savings)}`;

  return (
    <section id="sizing" data-nav-tone="dark" aria-labelledby="sizing-title" className="tone-dark scroll-mt-[120px]">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="sizing-title"
          title={["Size your office AI", "in ten seconds."]}
          lede="You don't need a data center. Set your team size and security level to see a turnkey setup and the annual savings over per-seat cloud AI."
          split
        />

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-14">
          <div className="flex flex-col gap-12">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`${id}-users`}>
                  <Caption>Employees using AI</Caption>
                </label>
                <output
                  htmlFor={`${id}-users`}
                  className="font-display text-[clamp(2rem,1.4rem+1.4vw,2.75rem)] font-[420] leading-none tracking-[-0.04em] text-fg tabular-nums"
                >
                  {fmt(users)}
                </output>
              </div>
              <input
                id={`${id}-users`}
                type="range"
                min={25}
                max={2500}
                step={25}
                value={users}
                onChange={(e) => setUsers(Number(e.target.value))}
                className="mt-5 w-full cursor-pointer accent-[oklch(0.82_0.17_152)]"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[0.75rem] text-fg-subtle">
                {TICKS.map((n) => (
                  <span key={n}>{fmt(n)}</span>
                ))}
              </div>
            </div>

            <div>
              <Caption>Industry compliance level</Caption>
              <div className="mt-3">
                <RailList
                  compact
                  label="Industry compliance level"
                  items={TIER_KEYS.map((k) => ({
                    key: k,
                    title: TIERS[k].label,
                    body: (
                      <>
                        {TIERS[k].who}. <span className="font-mono text-fg">{TIERS[k].badge}</span>
                      </>
                    ),
                  }))}
                  value={tier}
                  onChange={setTier}
                />
              </div>
            </div>
          </div>

          <StageCard
            title="Recommended turnkey architecture"
            aside={<Caption className="hidden text-fg sm:inline">0% IP egress</Caption>}
            bodyClassName="px-6 pb-6 pt-5 md:px-7 md:pb-7"
          >
            <div aria-live="polite">
              <h3 className="font-display text-[clamp(1.6rem,1rem+1.2vw,2.25rem)] font-[440] leading-[1.04] tracking-[-0.035em] text-fg [font-stretch:106%]">
                {t.title}
              </h3>
              <p className="mt-6 text-[0.8125rem] text-fg-subtle">Est. 3-year cloud savings, against per-seat enterprise cloud AI</p>
              <motion.p className="mt-1 font-display text-[clamp(2.5rem,1.6rem+2.4vw,3.75rem)] font-[400] leading-none tracking-[-0.045em] text-signal tabular-nums">
                {money}
              </motion.p>

              <div className="mt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <Caption>Office server</Caption>
                  <span className="font-mono text-[0.75rem] text-fg-subtle">
                    <span className="text-fg">{gpus}</span> of 8 GPU slots
                  </span>
                </div>
                <div aria-hidden className="mt-3 grid grid-cols-8 gap-1.5 rounded-[12px] border border-line p-1.5">
                  {Array.from({ length: 8 }, (_, i) => {
                    const lit = i < gpus;
                    return (
                      <span
                        key={i}
                        className={cn(
                          "relative flex h-12 flex-col justify-center gap-1 overflow-hidden rounded-[6px] border px-1.5 transition-[border-color,background-color] duration-500",
                          lit ? "border-signal/60 bg-signal/[0.08]" : "border-line bg-transparent"
                        )}
                        style={{ transitionDelay: `${i * 40}ms` }}
                      >
                        {[0, 1, 2].map((r) => (
                          <span key={r} className={cn("h-[2px] rounded-full transition-colors duration-500", lit ? "bg-signal/70" : "bg-fg/10")} />
                        ))}
                        {lit && !reduce && (
                          <motion.span
                            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-signal/25 to-transparent"
                            initial={{ left: "-50%" }}
                            animate={{ left: "120%" }}
                            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2, delay: i * 0.15 }}
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <dl className="mt-8 border-t border-line text-[0.9375rem]">
                <Row label="Workload split">
                  {t.split} <span className="text-fg-subtle">· {t.splitNote.toLowerCase()}</span>
                </Row>
                <Row label="Office server">
                  {server} <span className="text-fg-subtle">· fits a standard office closet</span>
                </Row>
                {MODEL_STACK.map(([k, v]) => (
                  <Row key={k} label={k}>
                    {v}
                  </Row>
                ))}
                <Row label="Deployment">Under 48 hours on site</Row>
              </dl>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[40ch] text-[0.75rem] text-fg-subtle">
                Estimate: $75 per user per month in cloud seats and agent usage over three years, less the hardware.
              </p>
              <a
                href={bookingUrl({ notes })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (openBooking({ notes })) e.preventDefault();
                }}
                className="group inline-flex rounded-full"
              >
                <PillChip size="md" variant="primary">
                  Book a demo with this spec
                </PillChip>
              </a>
            </div>
          </StageCard>
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-3 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}
