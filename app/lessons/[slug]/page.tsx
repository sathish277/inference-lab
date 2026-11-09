import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COURSE, TOTAL_LESSONS, findLesson } from '@/content/course';
import { LESSON_CONTENT } from '@/content/lessons';
import { LessonView } from '@/components/lesson/LessonView';

export function generateStaticParams() {
  return COURSE.flatMap((m) => m.lessons.filter((l) => l.slug && LESSON_CONTENT[l.slug]).map((l) => ({ slug: l.slug! })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findLesson(slug);
  return { title: found ? `${found.lesson.title} · Inference Lab` : 'Inference Lab' };
}

/** The next lesson's link, only if it's built. */
function nextHref(n: number): string | undefined {
  const next = COURSE.flatMap((m) => m.lessons).find((l) => l.n === n);
  return next?.slug ? `/lessons/${next.slug}/` : undefined;
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findLesson(slug);
  const content = LESSON_CONTENT[slug];
  if (!found || !content) notFound();
  return (
    <LessonView
      slug={slug}
      number={found.lesson.n}
      total={TOTAL_LESSONS}
      moduleNumber={found.moduleIndex + 1}
      moduleTitle={found.module.title}
      free={!!found.lesson.free}
      nextHref={nextHref(content.next.n)}
    />
  );
}
