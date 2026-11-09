'use client';
// The lesson template every lesson uses:
//   Hook → Predict → Lab (3D scene + four tabs) → Check yourself → Done when → Next lesson

import dynamic from 'next/dynamic';
import { Predict } from './Predict';
import { Quiz } from './Quiz';
import { LabPanel } from './LabPanel';
import { useLab } from '@/store/lab';
import type { LessonContent } from '@/content/lessons/memory-wall';

// 3D only runs in the browser, never during the static build.
const Stage = dynamic(() => import('@/world/Stage').then((m) => m.Stage), { ssr: false });
const MemoryWallScene = dynamic(() => import('@/scenes/MemoryWallScene').then((m) => m.MemoryWallScene), { ssr: false });

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
          <a href={homeHref}>Inside the Machine</a>
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
          <Stage>
            <MemoryWallScene />
          </Stage>
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
