'use client';
// The side panel next to the 3D scene. The tab bar and Overview are the same for every lesson;
// each lesson supplies its own Parts, Run and Math tabs (see lessons/registry.tsx).

import type { ComponentType } from 'react';
import { useLab, type TabId } from '@/store/lab';
import type { LessonContent } from '@/content/types';

export type LessonTabs = {
  Parts: ComponentType;
  Run: ComponentType;
  Math: ComponentType;
  runLabel?: string; // e.g. "Play with it"
};

function Overview({ lesson }: { lesson: LessonContent }) {
  const set = useLab((s) => s.set);
  return (
    <div className="tab-body">
      {lesson.overview.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <h3>Try this</h3>
      <ol className="try">
        {lesson.tryThis.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <button type="button" className="primary" onClick={() => set({ tab: 'run', camera: 'inside' })}>
        Start the lab
      </button>
    </div>
  );
}

export function LabPanel({ lesson, tabs }: { lesson: LessonContent; tabs: LessonTabs }) {
  const tab = useLab((s) => s.tab);
  const set = useLab((s) => s.set);
  const list: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'parts', label: 'Parts' },
    { id: 'run', label: tabs.runLabel ?? 'Watch it run' },
    { id: 'math', label: 'The math' },
  ];
  const { Parts, Run, Math } = tabs;
  const panelId = `tabpanel-${lesson.slug}`;
  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Lesson views">
        {list.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${lesson.slug}-${t.id}`}
            data-tab={t.id}
            aria-selected={tab === t.id}
            aria-controls={panelId}
            onClick={() => set({ tab: t.id, ...(t.id === 'run' || t.id === 'parts' ? { camera: 'inside' as const } : {}) })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={`tab-${lesson.slug}-${tab}`}>
        {tab === 'overview' && <Overview lesson={lesson} />}
        {tab === 'parts' && <Parts />}
        {tab === 'run' && <Run />}
        {tab === 'math' && <Math />}
      </div>
    </div>
  );
}
