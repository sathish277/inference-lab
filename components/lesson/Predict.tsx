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
};

export function Predict({ question, hint, answerLow, answerHigh, working, takeaway, unit }: Props) {
  const [guess, setGuess] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [checked, setChecked] = useState(false);

  const g = parseFloat(guess);
  let feedback = 'No guess? Here’s the working:';
  if (!Number.isNaN(g)) {
    if (g >= answerLow && g <= answerHigh) feedback = `Spot on. ${g} ${unit} is right in the range.`;
    else if (g > answerHigh) feedback = `${g} ${unit} is too high. RAM can’t deliver the model that often.`;
    else feedback = `${g} ${unit} is too low. The laptop can do better than that.`;
  }

  return (
    <section className="predict" aria-labelledby="predict-title">
      <span className="eyebrow">Predict first</span>
      <h2 id="predict-title">Make a guess before you look</h2>
      <p>{question}</p>
      <div className="row">
        <label htmlFor="guess" className="mono-label">
          My guess
        </label>
        <input id="guess" type="number" min={0} inputMode="decimal" placeholder={unit} value={guess} onChange={(e) => setGuess(e.target.value)} />
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
          <p>{takeaway} Now test it in the lab below.</p>
        </div>
      )}
    </section>
  );
}
