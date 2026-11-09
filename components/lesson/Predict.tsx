'use client';
// "Predict before you look": the learner commits to a guess first, which makes the answer stick.

import { useState } from 'react';

type Props = {
  question: string;
  hint: string;
  answerLow: number;
  answerHigh: number;
  working: string[];
  takeaway: string;
  unit: string;
  tooHigh: string;
  tooLow: string;
  /** Keeps element ids unique when several lessons share a page. */
  idPrefix: string;
};

export function Predict({ question, hint, answerLow, answerHigh, working, takeaway, unit, tooHigh, tooLow, idPrefix }: Props) {
  const [guess, setGuess] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [checked, setChecked] = useState(false);

  const g = parseFloat(guess);
  let feedback = 'No guess? Here’s the working:';
  if (!Number.isNaN(g)) {
    if (g >= answerLow && g <= answerHigh) feedback = `Spot on. ${g} ${unit} is right.`;
    else if (g > answerHigh) feedback = `${g} ${unit} ${tooHigh}`;
    else feedback = `${g} ${unit} ${tooLow}`;
  }

  return (
    <section className="predict" aria-labelledby={`${idPrefix}-predict-title`}>
      <span className="eyebrow">Predict first</span>
      <h2 id={`${idPrefix}-predict-title`}>Make a guess before you look</h2>
      <p>{question}</p>
      <div className="row">
        <label htmlFor={`${idPrefix}-guess`} className="mono-label">
          My guess
        </label>
        <input id={`${idPrefix}-guess`} type="number" min={0} inputMode="decimal" placeholder={unit} value={guess} onChange={(e) => setGuess(e.target.value)} />
        <button type="button" onClick={() => setShowHint(true)} disabled={showHint}>
          Show a hint
        </button>
        <button type="button" className="primary" onClick={() => setChecked(true)}>
          Check my answer
        </button>
      </div>
      {showHint && <p className="hint-box">Hint: {hint}</p>}
      {checked && (
        <div className="answer-box">
          <p className="strong">{feedback}</p>
          <ol className="working">
            {working.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ol>
          <p>{takeaway} Now try it in the lab below.</p>
        </div>
      )}
    </section>
  );
}
