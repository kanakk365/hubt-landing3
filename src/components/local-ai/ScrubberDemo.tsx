"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check, CheckCheck, Flame, Lock, ShieldCheck } from "lucide-react";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { SectionIntro } from "@/components/ai2/SectionIntro";
import { EXTRA_RULES, SCRUB_SCENARIOS, type Secret } from "@/lib/localAi";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { Caption, EASE, LiveDot, Marked, Segmented, SecretChip, StageCard, TagChip } from "./kit";

type Key = keyof typeof SCRUB_SCENARIOS;

/** The scenario's own secrets that are still in the text, then anything else that looks like one. */
function detect(text: string, base: Secret[]): Secret[] {
  const found: Secret[] = [];
  const seen = new Set<string>();
  base.forEach((s) => {
    if (text.includes(s.raw)) {
      found.push(s);
      seen.add(s.raw);
    }
  });
  let n = 1;
  EXTRA_RULES.forEach((r) => {
    for (const m of text.match(r.re) ?? []) {
      if (seen.has(m) || [...seen].some((s) => s.includes(m))) continue;
      seen.add(m);
      found.push({ raw: m, tag: `[${r.prefix}_${n++}]` });
    }
  });
  return found;
}

type Seg = { text: string; secret?: Secret };

/** Splits the text around every detected secret, longest first so nothing is matched twice. */
function segment(text: string, secrets: Secret[]): Seg[] {
  const sorted = [...secrets].sort((a, b) => b.raw.length - a.raw.length);
  let segs: Seg[] = [{ text }];
  sorted.forEach((s) => {
    segs = segs.flatMap((g) => {
      if (g.secret) return [g];
      const parts = g.text.split(s.raw);
      return parts.flatMap((p, i) => (i < parts.length - 1 ? [{ text: p }, { text: s.raw, secret: s }] : [{ text: p }]));
    });
  });
  return segs.filter((g) => g.text);
}

/** A short, stable fingerprint of the text, standing in for the receipt hash in the demo. */
function fingerprint(text: string) {
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 16777619) >>> 0;
    b = Math.imul(b + text.charCodeAt(i), 2246822519) >>> 0;
  }
  const hex = (a.toString(16) + b.toString(16)).padStart(16, "0");
  return `0x${hex.slice(0, 8)}…${hex.slice(-4)}`;
}

const MODELS = ["Gemini", "Claude", "GPT"] as const;
/** Run stages: 0 idle, 1 scanning inside, 2 tags cross, 3 models check, 4 answer back. */
const AT = [0, 0, 1100, 2100, 3400] as const;

/**
 * See what leaves your building. One card that runs like the airlock: the
 * question is scanned inside, each secret turns into a tag as it crosses,
 * three frontier models check the puzzle, and the answer comes back with the
 * real names put back in. It runs when it comes into view and whenever an
 * industry is picked; typing updates it live.
 */
export function ScrubberDemo() {
  const id = useId();
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const seen = useInView(root, { once: true, amount: 0.4 });
  const [key, setKey] = useState<Key>("finance");
  const [text, setText] = useState(SCRUB_SCENARIOS.finance.prompt);
  const [blocked, setBlocked] = useState(false);
  const [phase, setPhase] = useState(0);
  const [runId, setRunId] = useState(0);
  const [status, setStatus] = useState("");
  const timers = useRef<number[]>([]);

  const scen = SCRUB_SCENARIOS[key];
  const secrets = useMemo(() => detect(text, scen.secrets), [text, scen.secrets]);
  const segs = useMemo(() => segment(text, secrets), [text, secrets]);

  const clear = () => timers.current.forEach((t) => window.clearTimeout(t));

  const run = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setBlocked(false);
    setStatus("");
    setRunId((r) => r + 1);
    if (reduce) {
      setPhase(4);
      setStatus("Airlock verified: 0.00% of company secrets in the outbound packet.");
      return;
    }
    setPhase(1);
    timers.current = [2, 3, 4].map((ph) =>
      window.setTimeout(() => {
        setPhase(ph);
        if (ph === 4) setStatus("Airlock verified: 0.00% of company secrets in the outbound packet.");
      }, AT[ph])
    );
  }, [reduce]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (!seen) return;
    const t = window.setTimeout(run, 0);
    return () => window.clearTimeout(t);
  }, [seen, run]);

  const load = (k: Key) => {
    setKey(k);
    setText(SCRUB_SCENARIOS[k].prompt);
    run();
  };

  const crossed = phase >= 2;
  const answered = phase >= 4 && !blocked;

  return (
    <section id="scrubber" data-nav-tone="dark" aria-labelledby="scrubber-title" className="tone-dark scroll-mt-[120px]">
      <div ref={root} className="container-site py-24 md:py-36">
        <SectionIntro
          id="scrubber-title"
          title={["See what leaves your building,", "in plain English."]}
          lede="Pick your industry, or type a real company secret, and watch the scrubber hide your sensitive data before any outside AI is consulted."
          split
        />

        <StageCard
          className="mt-16 md:mt-24"
          title="Secret scrubber"
          aside={
            <Caption className="flex items-center gap-2">
              <LiveDot danger={blocked} />
              <span className="hidden md:inline">Live in your browser</span>
            </Caption>
          }
          bodyClassName="px-6 pb-6 pt-5 md:px-7 md:pb-7"
          segments={{ count: 4, lit: blocked ? 2 : phase }}
        >
          <Segmented
            label="Industry"
            size="sm"
            value={key}
            onChange={load}
            className="-ml-3"
            options={(Object.keys(SCRUB_SCENARIOS) as Key[]).map((k) => ({ key: k, label: SCRUB_SCENARIOS[k].label }))}
          />

          <label htmlFor={`${id}-input`} className="mt-6 block">
            <Caption>What your employee asks the office AI</Caption>
          </label>
          <textarea
            id={`${id}-input`}
            rows={3}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setBlocked(false);
              clear();
              setPhase(4);
            }}
            className="mt-2 w-full resize-none border-b [field-sizing:content] sm:min-h-[3.4em] border-line-strong bg-transparent pb-3 font-display text-[clamp(1.125rem,0.9rem+0.6vw,1.375rem)] font-[420] leading-snug tracking-[-0.02em] text-fg caret-signal outline-none transition-colors focus:border-signal"
          />
          <p className="mt-2 text-[0.8125rem] text-fg-subtle">Try a company name, a $ amount, a project code or a percentage.</p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] lg:gap-0">
            {/* Inside */}
            <div>
              <Caption className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-fg" /> Inside your office · 100% private
              </Caption>
              <div className="relative mt-4 min-h-[6.5rem] overflow-hidden">
                <p className="text-[1.0625rem] leading-[1.8] text-fg-muted">
                  {segs.map((g, i) =>
                    g.secret ? (
                      <SecretChip
                        key={i}
                        className={cn(
                          "transition-[box-shadow,border-color] duration-500",
                          phase >= 1 && "border-signal/60 shadow-[0_0_0_3px_oklch(0.82_0.17_152/0.12)]"
                        )}
                      >
                        {g.text}
                      </SecretChip>
                    ) : (
                      <React.Fragment key={i}>{g.text}</React.Fragment>
                    )
                  )}
                </p>
                {phase === 1 && !reduce && (
                  <motion.span
                    key={runId}
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-signal/20 to-transparent"
                    initial={{ left: "-6rem" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    <span className="absolute inset-y-0 left-1/2 w-px bg-signal" />
                  </motion.span>
                )}
              </div>
              <p className="mt-6 text-[0.8125rem] text-fg-subtle">
                Kept in your office vault ·{" "}
                <span className="text-fg">
                  {secrets.length} {secrets.length === 1 ? "secret" : "secrets"}
                </span>
              </p>
              <ul className="mt-2 border-t border-line">
                {secrets.map((s, i) => (
                  <motion.li
                    key={`${runId}-${s.raw}`}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0.25, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.15 + i * 0.12 }}
                    className="flex items-baseline justify-between gap-4 border-b border-line py-2 text-[0.8125rem]"
                  >
                    <span className="truncate text-fg">{s.raw}</span>
                    <span className="shrink-0 font-mono text-signal">{s.tag}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* The airlock between them */}
            <Gate active={phase === 2 && !blocked} blocked={blocked} reduce={reduce} />

            {/* Outside */}
            <div>
              <Caption className="flex items-center gap-2">
                <span className={cn("size-1.5 rounded-full", blocked ? "bg-rose" : "bg-signal")} /> Crosses the firewall · Gemini, Claude, GPT
              </Caption>
              <AnimatePresence mode="wait" initial={false}>
                {blocked ? (
                  <motion.div
                    key="blocked"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="mt-4 min-h-[6.5rem] space-y-1.5 text-[1rem] leading-relaxed"
                  >
                    <p className="font-medium text-rose">Blocked at the office firewall: 0 bytes sent.</p>
                    <p className="text-fg-muted">
                      An unmasked secret was caught by the hardware set-intersection gate. The connection was severed and your IP never left the
                      building.
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="out"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 min-h-[6.5rem] text-[1.0625rem] leading-[1.8] text-fg-muted"
                  >
                    {segs.map((g, i) => {
                      if (!g.secret) return <React.Fragment key={i}>{g.text}</React.Fragment>;
                      const k = Math.max(0, secrets.indexOf(g.secret));
                      return crossed ? (
                        <motion.span
                          key={`${runId}-${i}`}
                          initial={reduce ? false : { opacity: 0, filter: "blur(6px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : k * 0.14 }}
                        >
                          <TagChip>{g.secret.tag}</TagChip>
                        </motion.span>
                      ) : (
                        <span key={i} className="inline-block h-[0.9em] w-[5.5em] rounded-[4px] bg-fg/[0.07] align-[-0.1em]" />
                      );
                    })}
                  </motion.p>
                )}
              </AnimatePresence>

              <ol aria-label="Frontier models" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-[0.8125rem]">
                {MODELS.map((m, i) => (
                  <li key={m} className="flex items-center gap-2">
                    <ModelState state={blocked ? "idle" : phase >= 4 ? "done" : phase === 3 ? "checking" : "idle"} delay={i * 0.12} reduce={reduce} />
                    <span className={cn(blocked || phase < 3 ? "text-fg-subtle" : "text-fg")}>{m}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={run}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-fg/[0.035] px-4 text-[0.875rem] font-medium text-fg transition-colors hover:border-signal/45 hover:bg-signal/[0.06]"
                >
                  <ShieldCheck className="size-4 text-signal" /> Scrub and verify
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setPhase(2);
                    setBlocked(true);
                    setStatus("Leak attempt blocked: 0 bytes crossed the firewall.");
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[0.875rem] font-medium text-fg transition-colors hover:border-rose/50"
                >
                  <Flame className="size-4 text-rose" /> Test leak block
                </button>
              </div>
              <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-[0.8125rem] text-fg-muted">
                {status && (
                  <span className="inline-flex items-center gap-2">
                    <LiveDot danger={blocked} /> {status}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* The answer, back inside */}
          <div className="mt-8 grid gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <Caption className="flex flex-wrap items-center gap-x-3 gap-y-1">
                Final answer, unlocked in your office
                <span className={cn("inline-flex items-center gap-1.5 transition-opacity duration-500", answered ? "text-fg opacity-100" : "opacity-0")}>
                  <CheckCheck className="size-3.5 text-signal" /> 3 of 3 frontier models agreed
                </span>
              </Caption>
              <AnimatePresence mode="wait" initial={false}>
                {answered ? (
                  <motion.p
                    key={`${key}-${runId}`}
                    initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="mt-3 max-w-[70ch] text-[1.0625rem] leading-relaxed text-fg-muted"
                  >
                    <Marked text={scen.answer} />
                  </motion.p>
                ) : (
                  <motion.p
                    key="wait"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 min-h-[3.4em] text-[1.0625rem] leading-relaxed text-fg-subtle"
                  >
                    {blocked ? "Nothing was sent, so nothing comes back." : "Waiting for the three models…"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="lg:text-right">
              <Caption>Compliance receipt · demo</Caption>
              <p className="mt-1 font-mono text-[0.8125rem] text-fg">
                SHA256 {fingerprint(text)} · <span className={answered ? "text-signal" : "text-fg-subtle"}>{answered ? "verified" : "pending"}</span>
              </p>
            </div>
          </div>
        </StageCard>
      </div>
    </section>
  );
}

/** The gap between inside and outside: tags slide through it, secrets turn back. */
function Gate({ active, blocked, reduce }: { active: boolean; blocked: boolean; reduce: boolean }) {
  return (
    <div aria-hidden className="relative hidden lg:block">
      <span className={cn("absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-500", blocked ? "bg-rose/60" : "bg-line-strong")} />
      <span
        className={cn(
          "absolute left-1/2 top-[5rem] grid size-9 -translate-x-1/2 place-items-center rounded-full border bg-black transition-colors duration-500",
          blocked ? "border-rose text-rose" : active ? "border-signal text-signal" : "border-line-strong text-fg-subtle"
        )}
      >
        <Lock className="size-3.5" />
      </span>
      {active &&
        !reduce &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className={cn("absolute top-[6.05rem] size-1.5 rounded-full", i % 2 ? "bg-fg" : "bg-signal")}
            initial={{ left: "0%", opacity: 0 }}
            animate={i % 2 ? { left: ["0%", "40%", "0%"], opacity: [0, 1, 0] } : { left: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
    </div>
  );
}

function ModelState({ state, delay, reduce }: { state: "idle" | "checking" | "done"; delay: number; reduce: boolean }) {
  if (state === "done")
    return (
      <motion.span
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 26, delay: reduce ? 0 : delay }}
        className="grid size-4 place-items-center rounded-full bg-signal text-black"
      >
        <Check className="size-2.5" strokeWidth={3.5} />
      </motion.span>
    );
  if (state === "checking")
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
        className="size-4 rounded-full border border-signal/30 border-t-signal motion-safe:animate-spin"
      />
    );
  return <span className="size-4 rounded-full border border-dashed border-fg/25" />;
}
