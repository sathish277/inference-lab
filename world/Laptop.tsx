'use client';
// The shared 3D world: a laptop on a desk with its bottom cover removed, so you can see inside.
// Every lesson reuses this. Parts are simple shapes for now; Blender models replace them in Phase 3.
//
// Layout (x = left/right, y = up, z = toward you), in meters-ish units:
//   RAM sticks on the left, processor in the middle, SSD on the right,
//   a "bus" of gold traces between RAM and processor, and the screen behind.

import { useRef, type ReactNode } from 'react';
import type React from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { C } from './palette';
import { useLab, type PartId } from '@/store/lab';

export const LAYOUT = {
  baseY: 0.09,
  boardY: 0.2,
  ram: { x: [-1.62, -1.22], z: 0.05, length: 1.9, chips: 8 },
  processor: { x: 0.25, z: -0.15, size: 1.0 },
  ssd: { x: 1.45, z: 0.75 },
  bus: { fromX: -1.0, toX: -0.27, z: -0.15, lanes: 6, laneGap: 0.11 },
};

function Toon({ color, emissive, emissiveIntensity = 0 }: { color: string; emissive?: string; emissiveIntensity?: number }) {
  return <meshToonMaterial color={color} emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity} />;
}

/** A clickable part: hover shows a pointer, click opens it in the Parts tab. */
export function Part({ id, label, labelPos, children }: { id: PartId; label: string; labelPos: [number, number, number]; children: ReactNode }) {
  const selected = useLab((s) => s.selectedPart === id);
  const selectPart = useLab((s) => s.selectPart);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectPart(id);
  };
  return (
    <group
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {children}
      <Html position={labelPos} center zIndexRange={[10, 0]}>
        <button type="button" className={`scene-label${selected ? ' is-selected' : ''}`} onClick={() => selectPart(id)}>
          {label}
        </button>
      </Html>
    </group>
  );
}

export function Desk() {
  return (
    <mesh position={[0, -0.06, 0]} receiveShadow>
      <boxGeometry args={[14, 0.12, 9]} />
      <Toon color={C.desk} />
    </mesh>
  );
}

/** The laptop shell, board and screen. Children are the live parts placed on the board. */
export function LaptopBody({ screenTexture, children }: { screenTexture?: THREE.Texture | null; children?: ReactNode }) {
  return (
    <group>
      {/* bottom shell: a tray with low walls, open on top */}
      <RoundedBox args={[4.6, 0.12, 3.2]} radius={0.05} position={[0, 0.06, 0]}>
        <Toon color={C.shell} />
      </RoundedBox>
      {[
        { p: [0, 0.16, -1.57], s: [4.6, 0.2, 0.06] },
        { p: [0, 0.16, 1.57], s: [4.6, 0.2, 0.06] },
        { p: [-2.27, 0.16, 0], s: [0.06, 0.2, 3.2] },
        { p: [2.27, 0.16, 0], s: [0.06, 0.2, 3.2] },
      ].map((w, i) => (
        <mesh key={i} position={w.p as [number, number, number]}>
          <boxGeometry args={w.s as [number, number, number]} />
          <Toon color={C.shellDark} />
        </mesh>
      ))}

      {/* motherboard */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[4.4, 0.04, 3.0]} />
        <Toon color={C.board} />
      </mesh>
      {/* decorative board traces */}
      {[-1.1, -0.6, 0.55, 1.05].map((z, i) => (
        <mesh key={i} position={[0.6, 0.172, z]}>
          <boxGeometry args={[2.6, 0.004, 0.02]} />
          <Toon color={C.boardLine} />
        </mesh>
      ))}

      {/* screen: hinged at the back, tilted open */}
      <group position={[0, 0.2, -1.6]} rotation={[-0.22, 0, 0]}>
        <RoundedBox args={[4.6, 2.9, 0.1]} radius={0.05} position={[0, 1.45, 0]}>
          <Toon color={C.shellDark} />
        </RoundedBox>
        <mesh position={[0, 1.47, 0.056]}>
          <planeGeometry args={[4.3, 2.6]} />
          {screenTexture ? <meshBasicMaterial map={screenTexture} toneMapped={false} /> : <meshBasicMaterial color={C.screenOff} />}
        </mesh>
      </group>

      {children}
    </group>
  );
}

/**
 * Two RAM sticks with 16 chips in total. Each chip stands for 1/16 of the model's weights.
 * The scene animates the chips every frame through `chipMats` (no React re-render per frame).
 */
export function RamSticks({ chipMats }: { chipMats: React.MutableRefObject<THREE.MeshToonMaterial[]> }) {
  const { ram, boardY } = LAYOUT;
  const chipLen = ram.length / ram.chips;
  return (
    <Part id="ram" label="RAM · memory" labelPos={[-1.42, 0.45, 1.3]}>
      {ram.x.map((x, s) => (
        <group key={s} position={[x, boardY + 0.04, ram.z]}>
          <mesh>
            <boxGeometry args={[0.32, 0.05, ram.length + 0.1]} />
            <Toon color={C.board} />
          </mesh>
          {/* gold contacts along the edge that plugs into the board */}
          <mesh position={[0.17, -0.01, 0]}>
            <boxGeometry args={[0.03, 0.03, ram.length]} />
            <Toon color={C.gold} />
          </mesh>
          {Array.from({ length: ram.chips }).map((_, c) => {
            const idx = s * ram.chips + c;
            return (
              <mesh key={c} position={[-0.01, 0.045, -ram.length / 2 + chipLen * (c + 0.5)]}>
                <boxGeometry args={[0.22, 0.05, chipLen * 0.72]} />
                <meshToonMaterial
                  ref={(m) => {
                    if (m) chipMats.current[idx] = m;
                  }}
                  color={C.chip}
                  emissive={C.memory}
                  emissiveIntensity={0.04}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </Part>
  );
}

/** The processor: a package with a grid of 16 cores that glow while doing math (animated via `coreMats`). */
export function Processor({ coreMats }: { coreMats: React.MutableRefObject<THREE.MeshToonMaterial[]> }) {
  const { processor, boardY } = LAYOUT;
  const n = 4;
  const cell = 0.13;
  return (
    <Part id="processor" label="Processor · CPU + GPU" labelPos={[processor.x, 0.5, processor.z + 0.75]}>
      <group position={[processor.x, boardY, processor.z]}>
        <RoundedBox args={[processor.size, 0.06, processor.size]} radius={0.02} position={[0, 0.03, 0]}>
          <Toon color={C.chip} />
        </RoundedBox>
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.66, 0.03, 0.66]} />
          <Toon color={C.chipTop} />
        </mesh>
        {Array.from({ length: n * n }).map((_, i) => {
          const r = Math.floor(i / n);
          const c = i % n;
          return (
            <mesh key={i} position={[(c - (n - 1) / 2) * cell, 0.1, (r - (n - 1) / 2) * cell]}>
              <boxGeometry args={[cell * 0.78, 0.025, cell * 0.78]} />
              <meshToonMaterial
                ref={(m) => {
                  if (m) coreMats.current[i] = m;
                }}
                color="#2c4a4c"
                emissive={C.compute}
                emissiveIntensity={0}
              />
            </mesh>
          );
        })}
      </group>
    </Part>
  );
}

/** The SSD: an M.2 stick with a controller and two flash chips. */
export function Ssd({ active }: { active: boolean }) {
  const { ssd, boardY } = LAYOUT;
  return (
    <Part id="ssd" label="SSD · storage" labelPos={[ssd.x, 0.6, ssd.z + 0.45]}>
      <group position={[ssd.x, boardY + 0.03, ssd.z]}>
        <mesh>
          <boxGeometry args={[1.25, 0.04, 0.32]} />
          <Toon color={C.board} />
        </mesh>
        {[-0.38, 0.0, 0.38].map((x, i) => (
          <mesh key={i} position={[x, 0.035, 0]}>
            <boxGeometry args={[i === 0 ? 0.2 : 0.3, 0.035, 0.24]} />
            <Toon color={C.chip} emissive={C.memory} emissiveIntensity={active && i > 0 ? 0.35 : 0.02} />
          </mesh>
        ))}
      </group>
    </Part>
  );
}

/** Gold traces connecting RAM and processor: the "road" weights travel on. */
export function Bus() {
  const { bus, boardY } = LAYOUT;
  const len = bus.toX - bus.fromX;
  return (
    <Part id="bus" label="Memory bus" labelPos={[(bus.fromX + bus.toX) / 2, 0.4, bus.z - 0.62]}>
      {Array.from({ length: bus.lanes }).map((_, i) => (
        <mesh key={i} position={[bus.fromX + len / 2, boardY - 0.02 + 0.004, bus.z + (i - (bus.lanes - 1) / 2) * bus.laneGap]}>
          <boxGeometry args={[len, 0.006, 0.035]} />
          <Toon color={C.gold} />
        </mesh>
      ))}
    </Part>
  );
}

export function useStableRef<T>(value: T) {
  const r = useRef(value);
  r.current = value;
  return r;
}
