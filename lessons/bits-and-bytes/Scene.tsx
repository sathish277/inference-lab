'use client';
// Lesson 1 scene: one byte from a RAM chip, magnified and floating above the laptop.
//
// What you see, and what it means:
//   a glowing chip on the RAM stick   -> where this byte physically lives
//   8 rocker switches                 -> 8 bits; up and glowing = on (1), down and dark = off (0)
//   the numbers under each switch     -> its place value (128 … 1)
//   the laptop screen                 -> the byte written as 0s and 1s, and the number it stores
// Click a switch to flip it.

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, Line, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { LAYOUT, LaptopBody, Part, RamSticks } from '@/world/Laptop';
import { C } from '@/world/palette';
import { useLab, useLabStore } from '@/store/lab';
import { binaryString, flipBit, placeValues, toBits } from '@/lib/sim/bits';

const CELL_W = 0.36;
const GAP = 0.08;
const ROW_W = 8 * CELL_W + 7 * GAP;
const PANEL_POS: [number, number, number] = [0.15, 1.15, 0.8];
const PANEL_TILT = -0.42; // tip the panel toward the viewer
const SOURCE_CHIP = 2; // which RAM chip this byte comes from

const amber = new THREE.Color(C.memory);
const offColor = new THREE.Color('#56616c');

function useScreen() {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 620;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas, tex, ctx: canvas.getContext('2d')! };
  }, []);
}

/** One rocker switch. Its lever tilts and glows when the bit is 1. */
function Switch({ index, on, x }: { index: number; on: boolean; x: number }) {
  const store = useLabStore();
  const lever = useRef<THREE.Mesh>(null);
  const leverMat = useRef<THREE.MeshToonMaterial>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, dt) => {
    if (!lever.current || !leverMat.current) return;
    const k = 1 - Math.exp(-dt * 14); // smooth, frame-rate independent easing
    const targetRot = on ? -0.42 : 0.42;
    lever.current.rotation.x += (targetRot - lever.current.rotation.x) * k;
    leverMat.current.color.lerp(on ? amber : offColor, k);
    leverMat.current.emissiveIntensity += ((on ? 0.55 : 0) - leverMat.current.emissiveIntensity) * k;
    if (led.current) led.current.color.lerp(on ? amber : new THREE.Color('#2b333b'), k);
  });

  const flip = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const s = store.getState();
    const next = flipBit(s.byteValue, index);
    const won = s.target !== null && next === s.target;
    s.set({ byteValue: next, ...(won ? { wins: s.wins + 1 } : {}) });
  };

  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[CELL_W, 0.12, 0.5]} radius={0.03} position={[0, 0.06, 0]}>
        <meshToonMaterial color={C.chip} />
      </RoundedBox>
      <mesh
        ref={lever}
        position={[0, 0.16, 0]}
        onClick={flip}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <boxGeometry args={[CELL_W * 0.62, 0.1, 0.3]} />
        <meshToonMaterial ref={leverMat} color={on ? C.memory : '#56616c'} emissive={C.memory} emissiveIntensity={on ? 0.55 : 0} />
      </mesh>
      <mesh position={[0, 0.125, 0.205]}>
        <sphereGeometry args={[0.025, 12, 10]} />
        <meshBasicMaterial ref={led} color={on ? C.memory : '#2b333b'} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function BitsAndBytesScene() {
  const byteValue = useLab((s) => s.byteValue);

  const bits = toBits(byteValue);
  const places = placeValues(8);
  const chipMats = useRef<THREE.MeshToonMaterial[]>([]);
  const screen = useScreen();

  // Light up the RAM chip this byte comes from.
  useEffect(() => {
    const m = chipMats.current[SOURCE_CHIP];
    if (m) {
      m.color.set(C.memory);
      m.emissiveIntensity = 0.8;
    }
  });

  // Write the byte on the laptop screen.
  useEffect(() => {
    if (!screen) return;
    const { ctx, canvas, tex } = screen;
    ctx.fillStyle = '#121b24';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.font = '600 30px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillStyle = '#9fb0bf';
    ctx.fillText('ONE BYTE OF YOUR RAM', canvas.width / 2, 110);
    ctx.font = '700 118px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillStyle = C.memory;
    ctx.fillText(binaryString(byteValue), canvas.width / 2, 300);
    ctx.font = '600 92px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillStyle = '#e8eef3';
    ctx.fillText(`= ${byteValue}`, canvas.width / 2, 450);
    tex.needsUpdate = true;
  }, [byteValue, screen]);

  // Dashed line from the glowing chip up to the magnified byte.
  const ram = LAYOUT.ram;
  const chipLen = ram.length / ram.chips;
  const chipPos = new THREE.Vector3(ram.x[0], LAYOUT.boardY + 0.12, ram.z - ram.length / 2 + chipLen * (SOURCE_CHIP + 0.5));
  const panelLeft = new THREE.Vector3(PANEL_POS[0] - ROW_W / 2 - 0.12, PANEL_POS[1] + 0.02, PANEL_POS[2] - 0.05);

  const x0 = -ROW_W / 2 + CELL_W / 2;

  return (
    <LaptopBody screenTexture={screen?.tex}>
      <RamSticks chipMats={chipMats} label="RAM · about 64 billion switches" />
      <Line points={[chipPos, panelLeft]} color={C.memory} lineWidth={2} dashed dashSize={0.08} gapSize={0.06} />

      <group position={PANEL_POS} rotation={[PANEL_TILT, 0, 0]}>
        <Part id="byte" label="One byte = 8 switches" labelPos={[0, 0.62, -0.1]}>
          <RoundedBox args={[ROW_W + 0.3, 0.05, 0.95]} radius={0.04} position={[0, -0.03, 0.08]}>
            <meshToonMaterial color={C.shell} />
          </RoundedBox>
        </Part>
        {bits.map((b, i) => (
          <Switch key={i} index={i} on={b === 1} x={x0 + i * (CELL_W + GAP)} />
        ))}
        {places.map((p, i) => (
          <Html key={p} position={[x0 + i * (CELL_W + GAP), 0, 0.44]} center zIndexRange={[5, 0]}>
            <span className={`place${bits[i] ? ' on' : ''}`}>{p}</span>
          </Html>
        ))}
      </group>
    </LaptopBody>
  );
}

export const BITS_VIEWS = {
  laptop: { pos: [0.7, 4.9, 7.6] as [number, number, number], target: [0, 0.9, -0.2] as [number, number, number] },
  inside: { pos: [0.15, 3.9, 6.0] as [number, number, number], target: [0.15, 0.95, 0.6] as [number, number, number] },
};
