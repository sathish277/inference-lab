// Every built lesson's text, by slug. Safe to use on the server (no 3D code here).

import type { LessonContent } from '@/content/types';
import { bitsAndBytes } from './bits-and-bytes';
import { memoryWall } from './memory-wall';

export const LESSON_CONTENT: Record<string, LessonContent> = {
  [bitsAndBytes.slug]: bitsAndBytes,
  [memoryWall.slug]: memoryWall,
};
