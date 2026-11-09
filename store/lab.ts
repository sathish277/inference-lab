'use client';
// State for ONE lesson: its knobs, which part is selected, which tab is open, where the camera is.
// Each lesson on a page gets its own copy (via <LabProvider>), so two lessons never share knobs.
// The 3D scene, the side panel and the math tab all read from here, so they always agree.

import { createContext, createElement, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';

export type PartId = string;
export type TabId = 'overview' | 'parts' | 'run' | 'math';
export type CameraView = 'laptop' | 'inside';

export type LabState = {
  // shared by every lesson
  selectedPart: PartId | null;
  tab: TabId;
  camera: CameraView;
  // Lesson 13: the memory wall
  deviceId: string;
  paramsB: number;
  bits: number;
  batch: number;
  output: string;
  tokenCount: number;
  // Lesson 1: bits and bytes
  byteValue: number; // the number stored in the 8 switches (0–255)
  target: number | null; // the "make this number" challenge
  wins: number;
  // actions
  set: (patch: Partial<Omit<LabState, 'set' | 'selectPart'>>) => void;
  selectPart: (p: PartId) => void;
};

export function createLabStore() {
  return createStore<LabState>()((set) => ({
    selectedPart: null,
    tab: 'overview',
    camera: 'laptop',
    deviceId: 'laptop-dual',
    paramsB: 7,
    bits: 4,
    batch: 1,
    output: '',
    tokenCount: 0,
    byteValue: 0b00100101,
    target: null,
    wins: 0,
    set: (patch) => set(patch),
    selectPart: (p) => set({ selectedPart: p, tab: 'parts', camera: 'inside' }),
  }));
}

const LabContext = createContext<StoreApi<LabState> | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createLabStore);
  return createElement(LabContext.Provider, { value: store }, children);
}

export function useLab(): LabState;
export function useLab<T>(selector: (s: LabState) => T): T;
export function useLab<T>(selector?: (s: LabState) => T) {
  const store = useContext(LabContext);
  if (!store) throw new Error('useLab must be used inside <LabProvider>');
  return useStore(store, selector ?? ((s: LabState) => s as unknown as T));
}

/** The store itself, for event handlers that need the latest state without re-rendering. */
export function useLabStore(): StoreApi<LabState> {
  const store = useContext(LabContext);
  if (!store) throw new Error('useLabStore must be used inside <LabProvider>');
  return store;
}
