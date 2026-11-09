import { COURSE, TOTAL_LESSONS, findLesson } from '@/content/course';
import { memoryWall } from '@/content/lessons/memory-wall';
import { LessonView } from '@/components/lesson/LessonView';

// SINGLE_PAGE=1 builds a one-page preview: the lesson sits below the outline and links jump to it.
// Some preview hosts can't open other pages, but in-page #links always work.
const SINGLE = process.env.SINGLE_PAGE === '1';
const lessonHref = (slug: string) => (SINGLE ? `#${slug}` : `/lessons/${slug}/`);

export default function Home() {
  const built = COURSE.flatMap((m) => m.lessons).filter((l) => l.slug).length;
  return (
    <main className="home" id="top">
      <header className="home-head">
        <span className="pill">An interactive course · {TOTAL_LESSONS} lessons</span>
        <h1>Inside the Machine</h1>
        <p className="hook">
          Open up a laptop and watch an AI model run, token by token. Learn how hardware really runs AI, from bits and bytes to GPUs and
          quantization. No hardware background needed.
        </p>
        <div className="row">
          <a className="button primary" href={lessonHref('the-memory-wall')}>
            Start the free lesson: The memory wall
          </a>
          <span className="muted">
            {built} of {TOTAL_LESSONS} lessons ready
          </span>
        </div>
      </header>

      <section className="modules" aria-label="Course outline">
        {COURSE.map((m, mi) => (
          <div key={m.id} className="module">
            <div className="module-head">
              <span className="module-no">Module {mi + 1}</span>
              {m.free && <span className="pill free">Free</span>}
            </div>
            <h2>{m.title}</h2>
            <p className="muted">{m.blurb}</p>
            <ol className="lesson-list">
              {m.lessons.map((l) => (
                <li key={l.n} className={l.slug ? 'ready' : ''}>
                  <span className="n num">{l.n}</span>
                  <span className="t">
                    {l.slug ? <a href={lessonHref(l.slug)}>{l.title}</a> : l.title}
                    <span className="qq">{l.question}</span>
                  </span>
                  <span className="status">{l.slug ? (l.free ? 'Free · open' : 'Open') : 'Coming soon'}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>
      {SINGLE && (() => {
        const found = findLesson(memoryWall.slug)!;
        return (
          <div id={memoryWall.slug} className="single-lesson">
            <LessonView
              lesson={memoryWall}
              number={found.lesson.n}
              total={TOTAL_LESSONS}
              moduleNumber={found.moduleIndex + 1}
              moduleTitle={found.module.title}
              free={!!found.lesson.free}
              homeHref="#top"
            />
          </div>
        );
      })()}
      <footer className="site-foot">Built with real device specs. Every number shows its source.</footer>
    </main>
  );
}
