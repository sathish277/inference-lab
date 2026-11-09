'use client';
// End-of-lesson quiz. A wrong answer reveals the hint, so learners try again before seeing the explanation.

import { useState } from 'react';
import type { QuizItem } from '@/content/types';

function Question({ item, index, onDone }: { item: QuizItem; index: number; onDone: (firstTry: boolean) => void }) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const [hint, setHint] = useState(false);

  const pick = (i: number) => {
    if (right) return;
    if (i === item.answer) {
      setRight(true);
      onDone(wrong.length === 0);
    } else {
      setWrong((w) => [...w, i]);
      setHint(true);
    }
  };

  return (
    <div className="q">
      <h3>
        {index + 1}. {item.q}
      </h3>
      {!hint && (
        <button type="button" className="link" onClick={() => setHint(true)}>
          Show hint
        </button>
      )}
      {hint && <p className="q-hint">{item.hint}</p>}
      <div className="opts">
        {item.options.map((o, i) => (
          <button
            key={o}
            type="button"
            className={right && i === item.answer ? 'right' : wrong.includes(i) ? 'wrong' : ''}
            onClick={() => pick(i)}
            aria-pressed={right && i === item.answer}
          >
            {o}
          </button>
        ))}
      </div>
      {right && <p className="q-why">{item.why}</p>}
    </div>
  );
}

export function Quiz({ items }: { items: QuizItem[] }) {
  const [answered, setAnswered] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  return (
    <div className="quiz">
      {items.map((it, i) => (
        <Question
          key={it.q}
          item={it}
          index={i}
          onDone={(ft) => {
            setAnswered((a) => a + 1);
            if (ft) setFirstTry((f) => f + 1);
          }}
        />
      ))}
      <p className="score" aria-live="polite">
        {answered === 0
          ? `${items.length} questions`
          : `Answered ${answered} of ${items.length} · right on the first try: ${firstTry}`}
      </p>
    </div>
  );
}
