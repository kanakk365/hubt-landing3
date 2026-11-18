"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ArrowRight, BatteryCharging, Zap } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Assemble, MicroLabel, SCENE_EASE, SceneShell } from "./SceneShell";

const CODE = ["4", "8", "1", "9", "", ""];

/** Xura: the energy-infrastructure site with its partner portal and one-time-code sign-in. */
export function XuraScene({ tag }: { tag?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <SceneShell label="Xura site and partner portal sign-in" tag={tag}>
      <div className="flex h-full gap-3 p-3 @[520px]:gap-4 @[520px]:p-4">
        {/* Website hero */}
        <Assemble className="relative flex min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-[10px] border border-white/[0.08] bg-[radial-gradient(90%_80%_at_75%_30%,oklch(0.3_0_0/0.7),oklch(0.11_0_0)_70%)] p-3.5">
          {/* Concentric grid rings, slowly turning, behind the headline */}
          <motion.svg
            aria-hidden
            viewBox="0 0 200 200"
            className="pointer-events-none absolute -right-[18%] -top-[22%] h-[110%] opacity-40"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {[30, 50, 70, 90].map((r) => (
              <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="oklch(1 0 0 / 0.18)" strokeDasharray="2 5" />
            ))}
          </motion.svg>
          <div className="relative flex items-center justify-between">
            <span className="font-display text-[13px] font-semibold tracking-[0.08em] text-fg">XURA</span>
            <span className="hidden gap-2.5 @[440px]:flex">
              {["Solutions", "Projects", "Advertise"].map((l) => (
                <MicroLabel key={l}>{l}</MicroLabel>
              ))}
            </span>
          </div>
          <div className="relative">
            <MicroLabel className="text-fg-muted">Site-level energy infrastructure</MicroLabel>
            <p className="font-display mt-1.5 text-[17px] font-semibold leading-[1.05] tracking-[-0.03em] @[440px]:text-[20px]">
              Built for today&apos;s <span className="underline decoration-white/40 underline-offset-4">grid</span> constraints.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-fg px-2.5 py-1 text-[10.5px] font-semibold text-black">
                Request a site review
                <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-2.5">
            {[
              { icon: BatteryCharging, k: "Storage" },
              { icon: Zap, k: "Level 3" },
              { icon: Zap, k: "Microgrid" },
            ].map((s) => (
              <span key={s.k} className="flex items-center gap-1.5 text-[10px] text-fg-muted">
                <s.icon className="size-3 text-fg" />
                {s.k}
              </span>
            ))}
          </div>
        </Assemble>

        {/* Partner portal sign-in */}
        <Assemble
          delay={0.15}
          x={14}
          y={0}
          className="hidden w-[42%] max-w-[230px] flex-col rounded-[10px] border border-white/[0.08] bg-white/[0.025] p-3 @[400px]:flex"
        >
          <div className="flex rounded-full bg-white/[0.05] p-0.5 text-[10px]">
            {["Partner", "Advertiser"].map((r, i) => (
              <span key={r} className={cn("flex-1 rounded-full py-1 text-center", i === 0 ? "bg-white/[0.12] text-fg" : "text-fg-subtle")}>
                {r}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] font-medium">Check your email</p>
          <MicroLabel className="mt-0.5">Enter the 6-digit code we sent</MicroLabel>
          {/* Watched as a row: each digit starts below its own clip, so it can't watch itself. */}
          <motion.div className="mt-3 grid grid-cols-6 gap-1" initial={reduce ? false : "hidden"} whileInView="shown" viewport={{ once: true }}>
            {CODE.map((d, i) => (
              <span
                key={i}
                className={cn(
                  "grid aspect-[3/4] place-items-center overflow-hidden rounded-[5px] border font-mono text-[12px]",
                  i === 4 ? "border-white/70 shadow-[0_0_10px_-2px_oklch(1_0_0/0.5)]" : "border-white/[0.1]",
                  d ? "text-fg" : "text-fg-subtle"
                )}
              >
                {d ? (
                  <motion.span
                    variants={{ hidden: { y: "120%", opacity: 0 }, shown: { y: "0%", opacity: 1 } }}
                    transition={{ duration: 0.45, ease: SCENE_EASE, delay: 0.5 + i * 0.16 }}
                  >
                    {d}
                  </motion.span>
                ) : i === 4 ? (
                  <span className="h-3 w-px animate-pulse bg-fg motion-reduce:animate-none" />
                ) : (
                  ""
                )}
              </span>
            ))}
          </motion.div>
          <span className="mt-auto inline-flex items-center justify-center rounded-[7px] bg-fg py-1.5 text-[10.5px] font-semibold text-black">
            Verify and continue
          </span>
          <MicroLabel className="mt-2 text-center">EPC partners · contractors · installers</MicroLabel>
        </Assemble>
      </div>
    </SceneShell>
  );
}
