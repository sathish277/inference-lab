'use client';
// The lesson template every lesson uses:
//   Hook → Predict → Lab (3D scene + four tabs) → Check yourself → Done when → Next lesson
// Each lesson gets its own state (LabProvider), so two lessons on one page never share knobs.

import { Component, useEffect, useState, type ReactNode } from 'react';
import { Predict } from './Predict';
import { Quiz } from './Quiz';
import { LabPanel } from './LabPanel';
import { LabProvider, useLab } from '@/store/lab';
import { Stage } from '@/world/Stage';
import { LESSON_CONTENT } from '@/content/lessons';
import { LESSON_INTERACTIVE, type LessonInteractive } from '@/lessons/registry';

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

function SceneOverlay({ interactive }: { interactive: LessonInteractive }) {
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
        {interactive.legend.map((l) => (
          <span key={l.label}>
            <i className="dot" style={{ background: l.color }} /> {l.label}
          </span>
        ))}
      </div>
      <p className="scene-hint">{interactive.sceneHint}</p>
    </>
  );
}

type Props = {
  slug: string;
  number: number;
  total: number;
  moduleNumber: number;
  moduleTitle: string;
  free: boolean;
  /** Where the breadcrumb's course link goes. */
  homeHref?: string;
  /** Where "next lesson" links, if that lesson is built. */
  nextHref?: string;
};

export function LessonView({ slug, number, total, moduleNumber, moduleTitle, free, homeHref = '/', nextHref }: Props) {
  const lesson = LESSON_CONTENT[slug];
  const interactive = LESSON_INTERACTIVE[slug];
  if (!lesson || !interactive) return null;
  const { Scene } = interactive;

  return (
    <LabProvider>
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

        <Predict {...lesson.predict} idPrefix={slug} />

        <section className="lab" aria-label="Interactive lab">
          <div className="scene">
            <SceneErrorBoundary>
              <ClientOnly>
                <Stage views={interactive.views}>
                  <Scene />
                </Stage>
              </ClientOnly>
            </SceneErrorBoundary>
            <SceneOverlay interactive={interactive} />
          </div>
          <LabPanel lesson={lesson} tabs={interactive.tabs} />
        </section>

        <section className="check" aria-labelledby={`check-${slug}`}>
          <span className="eyebrow">Check yourself</span>
          <h2 id={`check-${slug}`}>Quiz</h2>
          <p className="muted">Try each one before opening the hint. Use the lab to test your answer.</p>
          <Quiz items={lesson.quiz} />
        </section>

        <section className="done" aria-labelledby={`done-${slug}`}>
          <h2 id={`done-${slug}`}>You’re done with this lesson when you can…</h2>
          <ul>
            {lesson.doneWhen.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="next">
            Next: Lesson {lesson.next.n}, {lesson.next.title}. {lesson.next.question}{' '}
            {nextHref ? (
              <a className="button primary" href={nextHref}>
                Go to Lesson {lesson.next.n}
              </a>
            ) : (
              <span className="soon">Coming soon</span>
            )}
          </p>
        </section>
      </main>
    </LabProvider>
  );
}
