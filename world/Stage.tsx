'use client';
// The 3D stage every lesson shares: canvas, lights, desk, camera and the camera moves between views.

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Desk } from './Laptop';
import { useLab, type CameraView } from '@/store/lab';

const VIEWS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number] }> = {
  laptop: { pos: [0.7, 4.9, 7.6], target: [0, 0.75, -0.3] },
  inside: { pos: [0, 6.2, 4.1], target: [0, 0, 0.1] },
};

function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const view = useLab((s) => s.camera);
  useEffect(() => {
    const v = VIEWS[view];
    ref.current?.setLookAt(...v.pos, ...v.target, true);
  }, [view]);
  return (
    <CameraControls
      ref={ref}
      minDistance={2.2}
      maxDistance={11}
      maxPolarAngle={1.4}
      truckSpeed={0}
      smoothTime={0.45}
    />
  );
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Stage({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(hasWebGL()), []);

  if (ok === false) {
    return (
      <div className="stage-fallback">
        <p>Your browser can’t show 3D here. Everything else in the lesson still works: use the tabs on the right.</p>
      </div>
    );
  }
  if (ok === null) return <div className="stage-fallback" aria-hidden="true" />;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: VIEWS.laptop.pos, fov: 36, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => (document.body.style.cursor = '')}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 5]} intensity={1.8} />
      <directionalLight position={[-5, 4, -3]} intensity={0.5} />
      <Suspense fallback={null}>
        <Desk />
        {children}
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
