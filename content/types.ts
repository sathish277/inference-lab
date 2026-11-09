// The shape every lesson's text follows. Keeping it fixed is what makes lessons quick to write.

export type QuizItem = { q: string; options: string[]; answer: number; hint: string; why: string };

export type LessonContent = {
  slug: string;
  title: string;
  hook: string;
  predict: {
    question: string;
    hint: string;
    unit: string;
    answerLow: number;
    answerHigh: number;
    tooHigh: string;
    tooLow: string;
    working: string[];
    takeaway: string;
  };
  overview: string[];
  tryThis: string[];
  quiz: QuizItem[];
  doneWhen: string[];
  next: { n: number; title: string; question: string };
};
