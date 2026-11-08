'use client';
// Shared state for one lesson: the knobs, which part is selected, which tab is open.
// The 3D scene, the side panel and the math tab all read from here, so they always agree.

import { create } from 'zustand';

export type PartId = 'ssd' | 'ram' | 'processor' | 'bus' | 'screen';
export type TabId = 'overview' | 'parts' | 'run' | 'math';
export type CameraView = 'laptop' | 'inside';

type LabState = {
  deviceId: string;
  paramsB: number;
  bits: number;
  batch: number;
  selectedPart: PartId | null;
  tab: TabId;
  camera: CameraView;
  output: string;
  tokenCount: number;
  set: (patch: Partial<Omit<LabState, 'set' | 'selectPart'>>) => void;
  selectPart: (p: PartId) => void;
};

export const useLab = create<LabState>((set) => ({
  deviceId: 'laptop-dual',
  paramsB: 7,
  bits: 4,
  batch: 1,
  selectedPart: null,
  tab: 'overview',
  camera: 'laptop',
  output: '',
  tokenCount: 0,
  set: (patch) => set(patch),
  selectPart: (p) => set({ selectedPart: p, tab: 'parts', camera: 'inside' }),
}));
