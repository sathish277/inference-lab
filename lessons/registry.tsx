'use client';
// Every built lesson's interactive pieces: its 3D scene, tabs, color key and camera views.
// To add a lesson: build its folder in lessons/, then add one entry here.

import type { ComponentType } from 'react';
import type { LessonTabs } from '@/components/lesson/LabPanel';
import { DEFAULT_VIEWS, type Views } from '@/world/Stage';
import { MemoryWallScene } from './memory-wall/Scene';
import * as MemoryWallTabs from './memory-wall/Tabs';
import { BITS_VIEWS, BitsAndBytesScene } from './bits-and-bytes/Scene';
import * as BitsTabs from './bits-and-bytes/Tabs';

export type LegendItem = { color: string; label: string };

export type LessonInteractive = {
  Scene: ComponentType;
  tabs: LessonTabs;
  legend: LegendItem[];
  views: Views;
  sceneHint: string;
};

export const LESSON_INTERACTIVE: Record<string, LessonInteractive> = {
  'bits-and-bytes': {
    Scene: BitsAndBytesScene,
    tabs: { Parts: BitsTabs.Parts, Run: BitsTabs.Run, Math: BitsTabs.MathTab, runLabel: 'Play with it' },
    legend: [
      { color: '#f0a43a', label: 'switch on (1)' },
      { color: '#56616c', label: 'switch off (0)' },
    ],
    views: BITS_VIEWS,
    sceneHint: 'Click a switch to flip it · drag to turn',
  },
  'the-memory-wall': {
    Scene: MemoryWallScene,
    tabs: { Parts: MemoryWallTabs.Parts, Run: MemoryWallTabs.Run, Math: MemoryWallTabs.MathTab },
    legend: [
      { color: '#f0a43a', label: 'weights moving' },
      { color: '#22a9a6', label: 'doing math' },
      { color: '#e5533f', label: 'doesn’t fit' },
    ],
    views: DEFAULT_VIEWS,
    sceneHint: 'Drag to turn · scroll to zoom · click a part',
  },
};
