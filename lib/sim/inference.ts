// The math behind the "memory wall" lesson.
// Kept separate from the 3D so it can be unit-tested: every number a learner sees is computed here.
//
// The one idea: to produce ONE token, the processor must use EVERY weight once.
//   time to read weights  = model size (GB) ÷ memory bandwidth (GB/s)
//   time to do the math   = 2 × parameters × users ÷ compute (operations/s)
//                            (each weight is used in one multiply and one add, per user)
// Both happen at the same time, so the slower one sets the pace.

import type { Device } from '@/data/devices';

/** Typical share of the theoretical bandwidth real tools (like llama.cpp) achieve. */
export const DEFAULT_EFFICIENCY = 0.6;

export type SimInput = {
  device: Device;
  paramsB: number; // parameters, in billions
  bits: number; // bits per weight (16, 8, 4)
  batch: number; // users served in the same step
  efficiency?: number;
};

export type SimResult = {
  sizeGB: number;
  fits: boolean;
  effectiveBandwidthGBs: number;
  readTimeS: number;
  computeTimeS: number;
  stepTimeS: number;
  bottleneck: 'memory' | 'compute';
  /** Share of each step the processor sits idle waiting for weights (0 when compute-bound). */
  idleFraction: number;
  /** Fraction of each step the processor is busy (used to light up the cores in 3D). */
  busyFraction: number;
  ceilingTokPerUser: number;
  realisticTokPerUser: number;
  realisticTotalTok: number;
  operationsPerStepB: number;
};

/** Size of the model's weights in GB: parameters × bytes per weight. */
export function modelSizeGB(paramsB: number, bits: number): number {
  return (paramsB * bits) / 8;
}

export function simulate({ device, paramsB, bits, batch, efficiency = DEFAULT_EFFICIENCY }: SimInput): SimResult {
  const sizeGB = modelSizeGB(paramsB, bits);
  const fits = sizeGB <= device.usableGB;
  // If the model doesn't fit, part of it keeps being re-read from somewhere much slower.
  const effectiveBandwidthGBs = fits ? device.bandwidthGBs : device.spillGBs;

  const readTimeS = sizeGB / effectiveBandwidthGBs;
  const operationsPerStepB = 2 * paramsB * batch; // in billions
  const computeTimeS = (operationsPerStepB * 1e9) / (device.tflops * 1e12);

  const stepTimeS = Math.max(readTimeS, computeTimeS);
  const bottleneck = readTimeS >= computeTimeS ? 'memory' : 'compute';
  const busyFraction = computeTimeS / stepTimeS;
  const idleFraction = bottleneck === 'memory' ? 1 - busyFraction : 0;

  const realStepS = stepTimeS / efficiency;
  return {
    sizeGB,
    fits,
    effectiveBandwidthGBs,
    readTimeS,
    computeTimeS,
    stepTimeS,
    bottleneck,
    idleFraction,
    busyFraction,
    ceilingTokPerUser: 1 / stepTimeS,
    realisticTokPerUser: 1 / realStepS,
    realisticTotalTok: batch / realStepS,
    operationsPerStepB,
  };
}

// ---------- formatting helpers shared by the UI ----------

export function fmtNum(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '–';
  if (n >= 1000) return Math.round(n).toLocaleString('en-US');
  if (n >= 100) return n.toFixed(0);
  return n.toFixed(digits);
}

export function fmtTime(seconds: number): string {
  const ms = seconds * 1000;
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 10) return `${ms.toFixed(0)} ms`;
  if (ms >= 1) return `${ms.toFixed(1)} ms`;
  return `${ms.toFixed(2)} ms`;
}
