import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COURSE, TOTAL_LESSONS, findLesson } from '@/content/course';
import { memoryWall } from '@/content/lessons/memory-wall';
import { LessonView } from '@/components/lesson/LessonView';

// Lesson text by slug. New lessons get added here as they're built.
const CONTENT = { [memoryWall.slug]: memoryWall };

export function generateStaticParams() {
  return COURSE.flatMap((m) => m.lessons.filter((l) => l.slug).map((l) => ({ slug: l.slug! })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findLesson(slug);
  return { title: found ? `${found.lesson.title} · Inference Lab` : 'Inference Lab' };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findLesson(slug);
  const content = CONTENT[slug];
  if (!found || !content) notFound();
  return (
    <LessonView
      lesson={content}
      number={found.lesson.n}
      total={TOTAL_LESSONS}
      moduleNumber={found.moduleIndex + 1}
      moduleTitle={found.module.title}
      free={!!found.lesson.free}
    />
  );
}
