"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Dices, RotateCcw, Zap } from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { SectionIntro } from "@/components/ai2/SectionIntro";
import { AUDIT_LOG, PROOFS, SALT_SECRETS, VENN } from "@/lib/localAi";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { Caption, EASE, LiveDot, RailList, StageCard } from "./kit";

type ProofKey = (typeof PROOFS)[number]["key"];

const BODIES: Record<ProofKey, React.ReactNode> = {
  overlap: (
    <>
      Picture every secret word, project name, customer record and database column inside one circle, S. Every word in the packet
      leaving your building sits in another, P. Before the network card sends anything, a hardware filter checks whether the two
      touch. Because every secret was swapped for a synthetic tag, they never do.
    </>
  ),
  information: (
    <>
      Couldn&rsquo;t an outside model guess the secret from its tag? No: tags are salted and generated fresh for every request in local
      memory, so a tag says nothing about the text behind it. The information shared between your secret and the token is 0.0000
      bits.
    </>
  ),
  audit: (
    <>
      Every outbound query leaves a receipt linking the internal query hash, the memory-vault hash and the exact sanitised packet,
      chained into an append-only ledger an auditor can verify.
    </>
  ),
};

/**
 * What happens if a secret tries to leave: three proofs behind the airlock,
 * indexed on the left the way the capabilities page lists its lines, with the
 * one you pick working in the card beside it. The overlap test leads: slide the
 * outbound packet into the company's secrets and the gate drops it.
 */
export function LeakTest() {
  const id = useId();
  const [tab, setTab] = useState<ProofKey>("overlap");
  const proof = PROOFS.find((p) => p.key === tab)!;

  return (
    <section id="leak-test" data-nav-tone="dark" aria-labelledby="leak-title" className="tone-dark scroll-mt-[120px]">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="leak-title"
          title={["What happens if a secret", "tries to leave."]}
          lede="Compliance officers don't have to trust prompts or vendor promises. Every outbound packet is checked before it is sent, and even a jailbroken agent can't push company IP through."
          split
        />

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-14">
          <div>
            <div>
              <RailList
                label="Proofs"
                panelId={`${id}-panel`}
                items={PROOFS.map((p) => ({
                  key: p.key,
                  title: p.tab,
                  body: (
                    <>
                      <span className="mb-3 block font-mono text-[0.875rem] text-fg">{p.formula}</span>
                      {BODIES[p.key]}
                    </>
                  ),
                }))}
                value={tab}
                onChange={setTab}
              />
            </div>
          </div>

          <div id={`${id}-panel`} role="tabpanel" aria-label={proof.tab} className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {tab === "overlap" && <Overlap />}
                {tab === "information" && <Information />}
                {tab === "audit" && <Audit />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 01 · Set disjointness, the interactive overlap test ─────────────── */

const R = 95;
const CY = 140;
const centres = (v: number) => ({ s: 185 + v * 0.65, p: 415 - v * 0.65 });
const ROSE = "oklch(0.72 0.17 12)";
const GREEN = "oklch(0.82 0.17 152)";

function Overlap() {
  const id = useId();
  // SVG references need a plain id: useId's punctuation breaks url(#…).
  const clip = `s-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  const raf = useRef(0);
  const { s, p } = centres(v);
  const touching = p - s < 2 * R;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const glide = (to: number) => {
    cancelAnimationFrame(raf.current);
    if (reduce) return setV(to);
    const from = v;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(from + (to - from) * e));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  return (
    <StageCard
      index="01"
      title="Company secrets against the outbound packet"
      aside={
        <Caption className={cn("flex items-center gap-2", touching ? "text-rose" : "text-fg")}>
          <LiveDot danger={touching} />
          <span aria-live="polite">{touching ? "Blocked" : "Pass"}</span>
        </Caption>
      }
      footer={
        <p className="border-t border-line pt-4 font-mono text-[0.8125rem] text-fg-muted">
          {touching ? (
            <>
              |S ∩ P| = 1 <span className="text-fg-subtle">→</span> <span className="text-rose">dropped at the network card, 0 bytes sent</span>
            </>
          ) : (
            <>
              |S ∩ P| = 0 <span className="text-fg-subtle">→</span> <span className="text-fg">sanitised packet allowed</span>
            </>
          )}
        </p>
      }
    >
      <svg
        viewBox="0 -6 600 296"
        className="w-full select-none"
        role="img"
        aria-label={touching ? "The circles overlap; the packet is blocked." : "The circles are apart; the packet passes."}
      >
        <defs>
          <clipPath id={clip}>
            <circle cx={s} cy={CY} r={R} />
          </clipPath>
          <filter id={`${clip}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Outbound traffic past the packet: it flows while the sets stay apart and stops dead when they touch. */}
        <line x1={p + R} y1={CY} x2="600" y2={CY} stroke={touching ? ROSE : GREEN} strokeOpacity={touching ? 0.5 : 0.3} strokeDasharray="2 6" />
        {!touching &&
          !reduce &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={`flow-${i}`}
              cy={CY}
              r="2.5"
              fill={GREEN}
              initial={{ cx: p + R, opacity: 0 }}
              animate={{ cx: [p + R, 600], opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, ease: "linear", repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
        {touching && (
          <g transform={`translate(${Math.min(560, p + R + 40)} ${CY})`} stroke={ROSE} strokeWidth="2" strokeLinecap="round">
            <line x1="-7" y1="-7" x2="7" y2="7" />
            <line x1="7" y1="-7" x2="-7" y2="7" />
          </g>
        )}

        <line x1="300" y1="18" x2="300" y2="248" stroke={touching ? ROSE : "oklch(1 0 0 / 0.35)"} strokeWidth="1.5" strokeDasharray="4 5" />

        <g transform={`translate(${s} ${CY})`}>
          <circle r={R} fill="none" stroke="oklch(1 0 0 / 0.5)" strokeWidth="6" filter={`url(#${clip}-glow)`} opacity="0.35" />
          <g className="motion-safe:animate-[spin_28s_linear_infinite]" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle r={R + 12} fill="none" stroke="oklch(1 0 0 / 0.28)" strokeDasharray="1 9" strokeLinecap="round" strokeWidth="2" />
          </g>
          <circle r={R} fill="oklch(0 0 0)" stroke="oklch(1 0 0 / 0.55)" strokeWidth="1.5" strokeDasharray="6 5" />
          <text y="-52" textAnchor="middle" fill="oklch(1 0 0 / 0.55)" fontSize="11" fontFamily="var(--font-geist-mono)" letterSpacing="1.5">
            S · SECRETS
          </text>
          {VENN.secrets.map((t, i) => (
            <text key={t} y={-16 + i * 24} textAnchor="middle" fill="oklch(0.975 0 0)" fontSize="12.5" fontWeight="500">
              {t}
            </text>
          ))}
        </g>

        <g transform={`translate(${p} ${CY})`}>
          <circle
            r={R}
            fill="none"
            stroke={touching ? ROSE : GREEN}
            strokeWidth="8"
            filter={`url(#${clip}-glow)`}
            opacity={touching ? 0.55 : 0.4}
            style={{ transition: "stroke 300ms, opacity 300ms" }}
          />
          <g className="motion-safe:animate-[spin_18s_linear_infinite_reverse]" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle r={R + 12} fill="none" stroke={touching ? ROSE : GREEN} strokeOpacity="0.45" strokeDasharray="1 9" strokeLinecap="round" strokeWidth="2" />
          </g>
          <circle r={R} fill="oklch(0 0 0 / 0.6)" stroke={touching ? ROSE : GREEN} strokeWidth="1.5" style={{ transition: "stroke 300ms" }} />
          <text y="-52" textAnchor="middle" fill={touching ? ROSE : GREEN} fontSize="11" fontFamily="var(--font-geist-mono)" letterSpacing="1.5">
            P · PACKET
          </text>
          {VENN.packet.map((t, i) => (
            <text key={t} y={-16 + i * 24} textAnchor="middle" fill={GREEN} fontSize="12" fontFamily="var(--font-geist-mono)">
              {t}
            </text>
          ))}
        </g>

        {/* The overlap itself, lit the moment the circles touch. */}
        {touching && (
          <motion.circle
            cx={p}
            cy={CY}
            r={R}
            fill={ROSE}
            clipPath={`url(#${clip})`}
            initial={reduce ? false : { opacity: 0.85 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        )}

        <g transform="translate(300 262)">
          <rect x="-86" y="-13" width="172" height="26" rx="13" fill="black" stroke={touching ? ROSE : "oklch(1 0 0 / 0.25)"} />
          <text y="4" textAnchor="middle" fontSize="10" fontFamily="var(--font-geist-mono)" letterSpacing="1.2" fill={touching ? ROSE : "oklch(1 0 0 / 0.7)"}>
            {touching ? "BLOCKED · 0 BYTES" : "FIREWALL GATE"}
          </text>
        </g>
      </svg>

      <div className="mt-2 grid gap-4 px-3 pb-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label htmlFor={`${id}-slider`} className="text-[0.875rem] text-fg">
            Slide to push a secret into the outbound packet
          </label>
          <input
            id={`${id}-slider`}
            type="range"
            min={0}
            max={100}
            value={v}
            aria-valuetext={touching ? `${v}% overlap: packet blocked` : `${v}%: no overlap, egress allowed`}
            onChange={(e) => {
              cancelAnimationFrame(raf.current);
              setV(Number(e.target.value));
            }}
            className={cn("mt-3 w-full cursor-pointer", touching ? "accent-[oklch(0.72_0.17_12)]" : "accent-[oklch(0.82_0.17_152)]")}
          />
          <div className="mt-1 flex justify-between text-[0.75rem] text-fg-subtle">
            <span>Normal airlock</span>
            <span>Unmasked leak attempt</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => glide(touching ? 0 : 56)}
          className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-line-strong bg-fg/[0.035] px-4 text-[0.875rem] font-medium text-fg transition-colors hover:border-fg/35 sm:self-auto"
        >
          {touching ? <RotateCcw className="size-3.5" /> : <Zap className="size-3.5 text-rose" />}
          {touching ? "Restore the airlock" : "Try a leak"}
        </button>
      </div>
    </StageCard>
  );
}

/* ── 02 · Zero mutual information: different secrets, identical tags ─── */

const hex = () => Math.floor(4096 + Math.random() * 61439).toString(16).toUpperCase();

function Information() {
  const [pattern, setPattern] = useState("[EVENT_8A1F] of [ENTITY_3C9B] for [VAL_7D2E]");
  const [rolled, setRolled] = useState(0);
  return (
    <StageCard
      index="02"
      title="Three secrets, one placeholder"
      aside={<Caption className="hidden text-fg sm:inline">P(secret | token) = P(secret)</Caption>}
      footer={
        <p className="border-t border-line pt-4 text-[0.875rem] leading-relaxed text-fg-muted">
          <span className="text-fg">The auditor&rsquo;s takeaway:</span> three different secrets produce identical placeholders on the wire.
          Without your local memory vault, reversing a token is impossible.
        </p>
      }
      bodyClassName="px-6 pb-5 pt-5 md:px-7"
    >
      <ol className="border-t border-line">
        {SALT_SECRETS.map((sec, i) => (
          <li key={sec} className="grid gap-2 border-b border-line py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-4">
            <span className="font-mono text-[0.8125rem] text-fg-subtle">{String.fromCharCode(65 + i)}</span>
            <span className="text-[0.9375rem] font-medium text-fg">“{sec}”</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${rolled}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="break-words font-mono text-[0.8125rem] text-signal"
              >
                {pattern}
              </motion.span>
            </AnimatePresence>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => {
          setPattern(`[EVENT_${hex()}] of [ENTITY_${hex()}] for [VAL_${hex()}]`);
          setRolled((r) => r + 1);
        }}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-fg/[0.035] px-4 text-[0.875rem] font-medium text-fg transition-colors hover:border-signal/45 hover:bg-signal/[0.06]"
      >
        <Dices className="size-4 text-signal" /> Roll a new 128-bit token salt
      </button>
    </StageCard>
  );
}

/* ── 03 · The audit chain, one receipt per outbound query ─────────────── */

function Audit() {
  const [verified, setVerified] = useState<boolean[]>(() => AUDIT_LOG.map(() => false));
  const all = verified.every(Boolean);
  return (
    <StageCard
      index="03"
      title="Append-only audit ledger"
      aside={
        <button
          type="button"
          onClick={() => setVerified(AUDIT_LOG.map(() => true))}
          disabled={all}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 text-[0.75rem] font-medium text-fg transition-colors hover:border-signal/45 disabled:text-fg-muted"
        >
          <Check className="size-3" strokeWidth={2.5} /> {all ? "Chain verified" : "Verify the chain"}
        </button>
      }
      bodyClassName="px-6 pb-6 pt-4 md:px-7"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-[0.8125rem]">
          <thead>
            <tr className="border-b border-line">
              {["Time (UTC)", "Department and agent", "Vaulted", "|S ∩ P|", "Leaf hash", ""].map((h) => (
                <th key={h} className="py-3 pr-4 font-mono text-[0.625rem] font-normal uppercase tracking-[0.16em] text-fg-subtle last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOG.map((r, i) => (
              <tr key={r.hash} className="border-b border-line last:border-0">
                <td className="py-3 pr-4 font-mono text-fg-subtle">{r.time}</td>
                <td className="py-3 pr-4 text-fg">{r.dept}</td>
                <td className="py-3 pr-4 text-fg-muted">{r.entities}</td>
                <td className="py-3 pr-4 font-mono text-fg">0</td>
                <td className="py-3 pr-4 font-mono text-fg-muted">{r.hash}</td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setVerified((v) => v.map((x, j) => (j === i ? true : x)))}
                    disabled={verified[i]}
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] font-medium transition-colors",
                      verified[i] ? "text-signal" : "border border-line-strong text-fg hover:border-signal/45"
                    )}
                  >
                    {verified[i] && <Check className="size-3" strokeWidth={2.5} />}
                    {verified[i] ? "Proven" : "Verify"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StageCard>
  );
}
