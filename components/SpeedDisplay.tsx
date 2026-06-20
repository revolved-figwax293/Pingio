"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useTestStore } from "@/store/testStore";

// Colors: Download = emerald green, Upload = blue, Ping = purple
const DL_COLOR = "#34d399"; // emerald-400
const UL_COLOR = "#60a5fa"; // blue-400
const PING_COLOR = "#a78bfa"; // purple-400

const SCALE_STEPS = [0, 10, 20, 50, 100, 250, 500, 750, 1000];

function fmtSpeed(v: number) {
  if (v >= 1000) return { num: (v / 1000).toFixed(2), unit: "Gbps" };
  if (v >= 100) return { num: v.toFixed(1), unit: "Mbps" };
  return { num: v.toFixed(2), unit: "Mbps" };
}

function speedToRatio(s: number): number {
  if (s <= 0) return 0;
  if (s >= 1000) return 1;
  for (let i = 0; i < SCALE_STEPS.length - 1; i++) {
    const v1 = SCALE_STEPS[i];
    const v2 = SCALE_STEPS[i + 1];
    if (s >= v1 && s <= v2) {
      const f = (s - v1) / (v2 - v1);
      return (i + f) / (SCALE_STEPS.length - 1);
    }
  }
  return 0;
}

interface SpeedDisplayProps {
  onStart?: () => void;
  onStop?: () => void;
}

export function SpeedDisplay({ onStart, onStop }: SpeedDisplayProps) {
  const {
    phase,
    currentDownload,
    currentUpload,
    currentPing,
    currentJitter,
  } = useTestStore();

  const isIdle = phase === "idle";
  const isPing = phase === "ping";
  const isDl = phase === "download";
  const isUl = phase === "upload";
  const isComplete = phase === "complete";
  const isActive = !isIdle && !isComplete;

  // 1. Animate speed values in React state for synchronized visual sweeps
  const [animatedDl, setAnimatedDl] = useState(0);
  const [animatedUl, setAnimatedUl] = useState(0);

  useEffect(() => {
    const controls = animate(animatedDl, currentDownload, {
      duration: isIdle ? 0.2 : 0.45,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => setAnimatedDl(Math.max(latest, 0)),
    });
    return () => controls.stop();
  }, [currentDownload, phase]);

  useEffect(() => {
    const controls = animate(animatedUl, currentUpload, {
      duration: isIdle ? 0.2 : 0.45,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => setAnimatedUl(Math.max(latest, 0)),
    });
    return () => controls.stop();
  }, [currentUpload, phase]);

  // Determine active color & status text based on phase
  let activeColor = "hsl(var(--foreground))";
  let statusText = "Ready";
  
  if (isPing) {
    activeColor = PING_COLOR;
    statusText = "Testing Latency";
  } else if (isDl) {
    activeColor = DL_COLOR;
    statusText = "Download";
  } else if (isUl) {
    activeColor = UL_COLOR;
    statusText = "Upload";
  } else if (isComplete) {
    activeColor = DL_COLOR;
    statusText = "Test Complete";
  } else {
    statusText = "Ready to test";
  }

  // 2. Math for Arc progress & Glowing dots (80% circle, 288 degrees)
  const dlRatio = speedToRatio(animatedDl);
  const dlArcLength = 703.71; // 288 degrees of R=140 circle
  const dlDashoffset = dlArcLength - (dlRatio * dlArcLength);
  const dlAngle = 126 + dlRatio * 288;
  const dlRad = (dlAngle * Math.PI) / 180;
  const dlDotX = Number((180 + 140 * Math.cos(dlRad)).toFixed(3));
  const dlDotY = Number((180 + 140 * Math.sin(dlRad)).toFixed(3));

  const ulRatio = speedToRatio(animatedUl);
  const ulArcLength = 603.18; // 288 degrees of R=120 circle
  const ulDashoffset = ulArcLength - (ulRatio * ulArcLength);
  const ulAngle = 126 + ulRatio * 288;
  const ulRad = (ulAngle * Math.PI) / 180;
  const ulDotX = Number((180 + 120 * Math.cos(ulRad)).toFixed(3));
  const ulDotY = Number((180 + 120 * Math.sin(ulRad)).toFixed(3));

  // Active speed for ticks/labels highlighting
  const activeSpeedForTicks = isDl 
    ? animatedDl 
    : isUl 
    ? animatedUl 
    : isComplete 
    ? Math.max(animatedDl, animatedUl) 
    : 0;

  // Generate ticks for the 9 scale steps (0, 10, 20, 50, 100, 250, 500, 750, 1000)
  const ticks = [];
  const startAngle = 126;
  const totalTicks = SCALE_STEPS.length;
  for (let i = 0; i < totalTicks; i++) {
    const angle = startAngle + i * (288 / (totalTicks - 1));
    const rad = (angle * Math.PI) / 180;
    const stepVal = SCALE_STEPS[i];
    
    // Tick is active if activeSpeed >= stepVal
    const isTickActive = activeSpeedForTicks >= stepVal && activeSpeedForTicks > 0;
    
    ticks.push({
      x1: Number((180 + 146 * Math.cos(rad)).toFixed(3)),
      y1: Number((180 + 146 * Math.sin(rad)).toFixed(3)),
      x2: Number((180 + 153 * Math.cos(rad)).toFixed(3)),
      y2: Number((180 + 153 * Math.sin(rad)).toFixed(3)),
      isTickActive,
      angle,
      text: stepVal.toString(),
    });
  }

  const formattedDl = fmtSpeed(animatedDl);
  const formattedUl = fmtSpeed(animatedUl);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[380px] mx-auto">
      {/* Gauge Container */}
      <div className="relative w-[360px] h-[360px] flex items-center justify-center">
        {/* SVG Dial Meter */}
        <svg viewBox="0 0 360 360" className="w-full h-full absolute inset-0">
          <defs>
            {/* Soft pulsing center glows */}
            <radialGradient id="dial-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={activeColor} stopOpacity={isIdle ? 0.02 : 0.08} />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center Glow */}
          <circle cx="180" cy="180" r="140" fill="url(#dial-glow)" />

          {/* ── Background Tracks ── */}
          {/* Download Background Track (Outer R=140) */}
          <circle
            cx="180"
            cy="180"
            r="140"
            fill="none"
            stroke="hsl(var(--border) / 0.15)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="703.71 879.64"
            transform="rotate(126, 180, 180)"
          />

          {/* Upload Background Track (Inner R=120) */}
          <circle
            cx="180"
            cy="180"
            r="120"
            fill="none"
            stroke="hsl(var(--border) / 0.08)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="603.18 753.98"
            transform="rotate(126, 180, 180)"
          />

          {/* ── Active Progress Tracks ── */}
          {/* Download Active Track */}
          <motion.circle
            cx="180"
            cy="180"
            r="140"
            fill="none"
            stroke={DL_COLOR}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="703.71 879.64"
            strokeDashoffset={dlDashoffset}
            transform="rotate(126, 180, 180)"
          />

          {/* Upload Active Track */}
          <motion.circle
            cx="180"
            cy="180"
            r="120"
            fill="none"
            stroke={UL_COLOR}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="603.18 753.98"
            strokeDashoffset={ulDashoffset}
            transform="rotate(126, 180, 180)"
          />

          {/* ── Ticks ── */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              className="transition-colors duration-300"
              stroke={t.isTickActive 
                ? (isDl ? DL_COLOR : isUl ? UL_COLOR : DL_COLOR) 
                : "hsl(var(--border) / 0.25)"
              }
              strokeWidth={t.isTickActive ? "2.5" : "1.5"}
            />
          ))}

          {/* ── Ticks Speed Labels ── */}
          {ticks.map((t, idx) => {
            const rad = (t.angle * Math.PI) / 180;
            // Radius for text positioning
            const lx = Number((180 + 166 * Math.cos(rad)).toFixed(3));
            const ly = Number((180 + 166 * Math.sin(rad)).toFixed(3));
            return (
              <text
                key={idx}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-semibold tracking-tight transition-colors duration-300"
                style={{
                  fill: t.isTickActive 
                    ? (isDl ? DL_COLOR : isUl ? UL_COLOR : DL_COLOR)
                    : "hsl(var(--muted-foreground) / 0.45)",
                }}
              >
                {t.text}
              </text>
            );
          })}

          {/* ── Glowing Needle Dots ── */}
          {/* Download Needle Dot */}
          {dlRatio > 0 && (
            <circle
              cx={dlDotX}
              cy={dlDotY}
              r="4"
              fill={DL_COLOR}
              style={{ filter: `drop-shadow(0 0 6px ${DL_COLOR})` }}
            />
          )}

          {/* Upload Needle Dot */}
          {ulRatio > 0 && (
            <circle
              cx={ulDotX}
              cy={ulDotY}
              r="4"
              fill={UL_COLOR}
              style={{ filter: `drop-shadow(0 0 6px ${UL_COLOR})` }}
            />
          )}
        </svg>

        {/* ── Center Content Overlay ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 select-none">
          {isIdle ? (
            // Idle State: Show large GO Button inside center
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-28 h-28 rounded-full border border-primary/20 bg-primary/5 hover:border-primary/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-[0_0_20px_rgba(52,211,153,0.03)]"
            >
              <span className="text-2xl font-bold uppercase tracking-[0.15em] text-primary animate-pulse">
                GO
              </span>
              <span className="text-[10px] text-muted-foreground/50 tracking-wider mt-1 font-medium">
                Start Test
              </span>
            </motion.button>
          ) : isComplete ? (
            // Completed State: Show speeds side-by-side & "Test Again"
            <div className="flex flex-col items-center gap-3 animate-fade-in mt-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                Test Complete
              </span>
              
              <div className="flex items-center gap-4">
                {/* Download */}
                <div className="flex flex-col items-center">
                  <span className="text-[28px] sm:text-[32px] font-light tabular-nums leading-none" style={{ color: DL_COLOR }}>
                    {formattedDl.num}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mt-1.5 font-semibold">Down</span>
                </div>

                <div className="w-px h-8 bg-border/40" />

                {/* Upload */}
                <div className="flex flex-col items-center">
                  <span className="text-[28px] sm:text-[32px] font-light tabular-nums leading-none" style={{ color: UL_COLOR }}>
                    {formattedUl.num}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mt-1.5 font-semibold">Up</span>
                </div>
              </div>
              
              <span className="text-[10px] text-muted-foreground/30 font-light uppercase tracking-wider">
                {formattedDl.unit}
              </span>

              {onStart && (
                <motion.button
                  onClick={onStart}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="cursor-pointer px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:border-primary/60 text-[9px] font-semibold text-primary tracking-wider uppercase mt-2.5"
                >
                  Test Again
                </motion.button>
              )}
            </div>
          ) : (
            // Running State: Show Active Metric value + cancel button
            <div className="flex flex-col items-center mt-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: activeColor }}>
                {statusText}
              </span>
              
              {isPing ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl font-light tabular-nums" style={{ color: PING_COLOR }}>
                    {currentPing > 0 ? currentPing.toFixed(1) : "—"}
                  </span>
                  <span className="text-[9px] text-purple-400/60 uppercase tracking-wider mt-1.5 font-semibold">ms latency</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-end gap-0.5 justify-center leading-none">
                    <span 
                      className="text-[44px] sm:text-[52px] font-light tracking-[-2px] tabular-nums leading-none"
                      style={{ color: activeColor }}
                    >
                      {isDl ? formattedDl.num : formattedUl.num}
                    </span>
                    <span className="text-xs font-light mb-1 ml-0.5" style={{ color: activeColor, opacity: 0.7 }}>
                      {isDl ? formattedDl.unit : formattedUl.unit}
                    </span>
                  </div>
                </div>
              )}

              {onStop && (
                <motion.button
                  onClick={onStop}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer text-[9px] text-red-500/70 hover:text-red-500 font-bold tracking-wider uppercase bg-red-500/10 px-3.5 py-1.5 rounded-full border border-red-500/20 hover:border-red-500/40 mt-5.5"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ping + Jitter bottom stats (fits in the 20% bottom space opening) */}
      <AnimatePresence>
        {(isActive || isComplete) && (currentPing > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-6 mt-[-10px] z-20 bg-background/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/10 animate-fade-in"
          >
            <Pill
              label="Ping"
              value={`${currentPing.toFixed(0)}`}
              unit="ms"
              color={PING_COLOR}
            />
            <div className="w-px h-4 bg-border/40" />
            <Pill 
              label="Jitter" 
              value={`${currentJitter.toFixed(0)}`} 
              unit="ms" 
              color="#fb923c" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}:
      </span>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-[9px] font-medium opacity-60" style={{ color }}>
        {unit}
      </span>
    </div>
  );
}