'use client';
// The lesson template every lesson uses:
//   Hook → Predict → Lab (3D scene + four tabs) → Check yourself → Done when → Next lesson

import { Component, useEffect, useState, type ReactNode } from 'react';
import { Predict } from './Predict';
import { Quiz } from './Quiz';
import { LabPanel } from './LabPanel';
import { useLab } from '@/store/lab';
import type { LessonContent } from '@/content/lessons/memory-wall';

import { Stage } from '@/world/Stage';
import { MemoryWallScene } from '@/scenes/MemoryWallScene';

/** Renders children only in the browser (3D can't run during the static build). */
function ClientOnly({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? <>{children}</> : null;
}

/** If the 3D scene crashes, show why instead of a blank box. The rest of the lesson keeps working. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (this.state.error)
      return (
        <div className="stage-fallback">
          <p>
            The 3D scene couldn’t start: <code>{this.state.error}</code>. The tabs on the right still work.
          </p>
        </div>
      );
    return this.props.children;
  }
}

type Props = {
  lesson: LessonContent;
  number: number;
  total: number;
  moduleNumber: number;
  moduleTitle: string;
  free: boolean;
  /** Where the breadcrumb's course link goes. */
  homeHref?: string;
};

function SceneOverlay() {
  const camera = useLab((s) => s.camera);
  const set = useLab((s) => s.set);
  return (
    <>
      <div className="scene-views" role="group" aria-label="Camera">
        <button type="button" aria-pressed={camera === 'laptop'} onClick={() => set({ camera: 'laptop' })}>
          Whole laptop
        </button>
        <button type="button" aria-pressed={camera === 'inside'} onClick={() => set({ camera: 'inside' })}>
          Look inside
        </button>
      </div>
      <div className="legend" aria-label="Color key">
        <span>
          <i className="dot mem" /> weights moving
        </span>
        <span>
          <i className="dot cpu" /> doing math
        </span>
        <span>
          <i className="dot bad" /> doesn’t fit
        </span>
      </div>
      <p className="scene-hint">Drag to turn · scroll to zoom · click a part</p>
    </>
  );
}

export function LessonView({ lesson, number, total, moduleNumber, moduleTitle, free, homeHref = '/' }: Props) {
  return (
    <main className="lesson">
      <header className="lesson-head">
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href={homeHref}>Inference Lab</a>
          <span aria-hidden="true">/</span>
          <span>
            Module {moduleNumber} · {moduleTitle}
          </span>
        </nav>
        <div className="title-row">
          <span className="lesson-no">
            Lesson {number} <span className="of">of {total}</span>
          </span>
          {free && <span className="pill free">Free</span>}
        </div>
        <h1>{lesson.title}</h1>
        <p className="hook">{lesson.hook}</p>
      </header>

      <Predict {...lesson.predict} unit="tokens/s" />

      <section className="lab" aria-label="Interactive lab">
        <div className="scene">
          <SceneErrorBoundary>
            <ClientOnly>
              <Stage>
                <MemoryWallScene />
              </Stage>
            </ClientOnly>
          </SceneErrorBoundary>
          <SceneOverlay />
        </div>
        <LabPanel lesson={lesson} />
      </section>

      <section className="check" aria-labelledby="check-title">
        <span className="eyebrow">Check yourself</span>
        <h2 id="check-title">Quiz</h2>
        <p className="muted">Try each one before opening the hint. Use the lab to test your answer.</p>
        <Quiz items={lesson.quiz} />
      </section>

      <section className="done" aria-labelledby="done-title">
        <h2 id="done-title">You’re done with this lesson when you can…</h2>
        <ul>
          {lesson.doneWhen.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="next">
          Next: Lesson {lesson.next.n}, {lesson.next.title}. {lesson.next.question} <span className="soon">Coming soon</span>
        </p>
      </section>
    </main>
  );
}
