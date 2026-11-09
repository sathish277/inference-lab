'use client';
// Lesson 13 scene: the whole model streams from RAM to the processor once per token.
//
// What you see, and what it means:
//   RAM chips light up one after another  -> the processor reading each slice of the weights
//   amber dots on the gold bus             -> weights travelling to the processor
//   teal cores                             -> the processor doing math (dark = waiting for data)
//   words on the screen                    -> tokens, appearing at the real speed of the chosen device
//   red + dots from the SSD                -> the model doesn't fit, so it keeps re-reading from storage

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Bus, LAYOUT, LaptopBody, Processor, RamSticks, Ssd } from '@/world/Laptop';
import { C } from '@/world/palette';
import { useLab } from '@/store/lab';
import { getDevice } from '@/data/devices';
import { fmtNum, simulate } from '@/lib/sim/inference';

const SAMPLE = (
  'A language model writes one token at a time. For each token it reads every weight from memory, ' +
  'multiplies, adds, and picks the next word. Then it does the whole thing again. That is why memory ' +
  'speed sets the pace on a laptop, and why smaller, quantized models feel so much faster. '
).split(/(?<=\s)/);

const MIN_VISIBLE_STEP = 0.25; // seconds; faster tokens are shown slowed down (and labelled as such)
const BUS_DOTS = 48;
const SPILL_DOTS = 18;

const tmp = new THREE.Object3D();
const memColor = new THREE.Color(C.memory);
const badColor = new THREE.Color(C.bad);
const chipColor = new THREE.Color(C.chip);
const computeColor = new THREE.Color(C.compute);
const coreIdle = new THREE.Color('#2c4a4c');

function useScreen() {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 620;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { canvas, tex, ctx: canvas.getContext('2d')! };
  }, []);
}

function drawScreen(
  s: NonNullable<ReturnType<typeof useScreen>>,
  text: string,
  header: string,
  footer: string,
  bad: boolean,
) {
  const { ctx, canvas } = s;
  ctx.fillStyle = '#121b24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1b2833';
  ctx.fillRect(0, 0, canvas.width, 64);
  ctx.font = '600 26px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillStyle = '#9fb0bf';
  ctx.fillText(header, 32, 42);
  ctx.font = '30px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillStyle = '#e8eef3';
  // word-wrap the tail of the text into the window
  const maxW = canvas.width - 64;
  const words = text.split(/(?<=\s)/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (ctx.measureText(line + w).width > maxW) {
      lines.push(line);
      line = w;
    } else line += w;
  }
  lines.push(line);
  const shown = lines.slice(-11);
  shown.forEach((l, i) => ctx.fillText(l, 32, 116 + i * 42));
  const last = shown.at(-1) ?? '';
  const cx = 32 + ctx.measureText(last).width + 4;
  ctx.fillStyle = C.compute;
  ctx.fillRect(cx, 116 + (shown.length - 1) * 42 - 26, 16, 32);
  ctx.font = '600 28px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillStyle = bad ? C.bad : C.memory;
  ctx.fillText(footer, 32, canvas.height - 28);
  s.tex.needsUpdate = true;
}

export function MemoryWallScene() {
  const deviceId = useLab((s) => s.deviceId);
  const paramsB = useLab((s) => s.paramsB);
  const bits = useLab((s) => s.bits);
  const batch = useLab((s) => s.batch);
  const setLab = useLab((s) => s.set);

  const device = getDevice(deviceId);
  const sim = useMemo(() => simulate({ device, paramsB, bits, batch }), [device, paramsB, bits, batch]);
  const simRef = useRef(sim);
  simRef.current = sim;

  const chipMats = useRef<THREE.MeshToonMaterial[]>([]);
  const coreMats = useRef<THREE.MeshToonMaterial[]>([]);
  const busDots = useRef<THREE.InstancedMesh>(null);
  const spillDots = useRef<THREE.InstancedMesh>(null);
  const screen = useScreen();

  const clock = useRef({ sweep: 0, flow: 0, acc: 0, text: '', count: 0, lastPush: 0 });

  // Restart the output whenever the setup changes, so the speed you see matches the knobs.
  useEffect(() => {
    clock.current.text = '';
    clock.current.count = 0;
    clock.current.acc = 0;
    setLab({ output: '', tokenCount: 0 });
  }, [deviceId, paramsB, bits, batch, setLab]);

  const header = `${paramsB}B model · ${bits}-bit · ${device.name}`;

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const r = simRef.current;
    const c = clock.current;
    const realStep = 1 / r.realisticTokPerUser;
    const visStep = Math.max(realStep, MIN_VISIBLE_STEP);

    // 1. One full sweep across the RAM chips = one token.
    c.sweep = (c.sweep + dt / visStep) % 1;
    const lit = Math.floor(c.sweep * 16);
    const hot = r.fits ? memColor : badColor;
    chipMats.current.forEach((m, i) => {
      if (!m) return;
      const isLit = i === lit;
      m.color.copy(isLit ? hot : chipColor);
      m.emissive.copy(hot);
      m.emissiveIntensity = isLit ? 0.95 : i < lit ? 0.14 : 0.03;
    });

    // 2. Cores are lit for the share of time they have work (busyFraction).
    coreMats.current.forEach((m, i) => {
      if (!m) return;
      const on = (c.sweep * 7 + i * 0.137) % 1 < r.busyFraction;
      m.color.copy(on ? computeColor : coreIdle);
      m.emissiveIntensity = on ? 1.0 : 0.02;
    });

    // 3. Dots travel along the bus; their speed follows the token speed.
    c.flow += dt / Math.max(0.12, visStep * 0.35);
    const { bus, boardY } = LAYOUT;
    if (busDots.current) {
      for (let i = 0; i < BUS_DOTS; i++) {
        const t = (c.flow + i / BUS_DOTS) % 1;
        const lane = i % bus.lanes;
        tmp.position.set(
          THREE.MathUtils.lerp(bus.fromX, bus.toX, t),
          boardY + 0.03,
          bus.z + (lane - (bus.lanes - 1) / 2) * bus.laneGap,
        );
        const s = Math.sin(t * Math.PI) * 0.9 + 0.2;
        tmp.scale.setScalar(s);
        tmp.updateMatrix();
        busDots.current.setMatrixAt(i, tmp.matrix);
      }
      busDots.current.instanceMatrix.needsUpdate = true;
      (busDots.current.material as THREE.MeshBasicMaterial).color.copy(hot);
    }

    // 4. When the model doesn't fit, weights also crawl in from the SSD.
    if (spillDots.current) {
      spillDots.current.visible = !r.fits;
      if (!r.fits) {
        for (let i = 0; i < SPILL_DOTS; i++) {
          const t = (c.flow * 0.25 + i / SPILL_DOTS) % 1;
          tmp.position.set(THREE.MathUtils.lerp(LAYOUT.ssd.x - 0.65, -1.05, t), boardY + 0.03, LAYOUT.ssd.z + 0.2);
          tmp.scale.setScalar(1);
          tmp.updateMatrix();
          spillDots.current.setMatrixAt(i, tmp.matrix);
        }
        spillDots.current.instanceMatrix.needsUpdate = true;
      }
    }

    // 5. Tokens appear on the screen at the REAL speed.
    c.acc += dt * r.realisticTokPerUser;
    let produced = false;
    while (c.acc >= 1) {
      c.acc -= 1;
      c.text += SAMPLE[c.count % SAMPLE.length];
      c.count++;
      produced = true;
    }
    if (c.text.length > 900) c.text = c.text.slice(-600);
    if (screen && (produced || c.count === 0)) {
      drawScreen(screen, c.text, header, `${fmtNum(r.realisticTokPerUser)} tokens/s`, !r.fits);
    }
    const now = state.clock.elapsedTime;
    if (produced && now - c.lastPush > 0.12) {
      c.lastPush = now;
      setLab({ output: c.text.slice(-320), tokenCount: c.count });
    }
  });

  return (
    <LaptopBody screenTexture={screen?.tex}>
      <RamSticks chipMats={chipMats} />
      <Processor coreMats={coreMats} />
      <Ssd active={!sim.fits} />
      <Bus />
      <instancedMesh ref={busDots} args={[undefined, undefined, BUS_DOTS]} frustumCulled={false}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshBasicMaterial color={C.memory} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={spillDots} args={[undefined, undefined, SPILL_DOTS]} frustumCulled={false} visible={false}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshBasicMaterial color={C.bad} toneMapped={false} />
      </instancedMesh>
    </LaptopBody>
  );
}
