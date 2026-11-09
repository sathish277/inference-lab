'use client';
// Lesson 1 tabs: Parts, Play with it, The math.

import { useState } from 'react';
import { useLab } from '@/store/lab';
import { binaryString, flipBit, maxValue, modelGB, placeValues, readable, sumOfPlaces, toBits, valuesFor } from '@/lib/sim/bits';

type PartInfo = { id: string; name: string; analogy: string; what: string; spec: (v: number) => string };

const PARTS: PartInfo[] = [
  {
    id: 'switch',
    name: 'Memory cell',
    analogy: 'A light switch',
    what: 'The smallest thing in memory. In RAM, each one is a tiny transistor (an electric gate) plus a tiny capacitor (a bucket that holds electric charge). Charged means 1, empty means 0. They are so small that billions fit on one chip.',
    spec: () => 'Your 8 GB of RAM holds about 64 billion of them.',
  },
  {
    id: 'bit',
    name: 'Bit',
    analogy: 'One yes-or-no answer',
    what: 'Short for “binary digit”: the value one switch holds, 0 or 1. Everything in a computer is made of bits: numbers, letters, photos, and every weight of an AI model.',
    spec: () => '1 bit = 2 possible values.',
  },
  {
    id: 'byte',
    name: 'Byte',
    analogy: 'A row of 8 switches',
    what: 'Eight bits in a row. Each position has a value: 128, 64, 32, 16, 8, 4, 2, 1. Add up the ones that are on to get the number. Memory and file sizes are counted in bytes.',
    spec: (v) => `Right now: ${binaryString(v)} = ${sumOfPlaces(v)} = ${v}`,
  },
  {
    id: 'ram',
    name: 'RAM chip',
    analogy: 'A giant grid of switches',
    what: 'Each black chip on a RAM stick holds billions of switches in a grid. The processor asks for a byte by its address, like a house number on a very long street.',
    spec: () => 'In the scene: 16 chips on 2 sticks. Together: 8 GB, about 8 billion bytes.',
  },
];

export function Parts() {
  const selected = useLab((s) => s.selectedPart);
  const selectPart = useLab((s) => s.selectPart);
  const v = useLab((s) => s.byteValue);
  const part = PARTS.find((p) => p.id === selected);
  return (
    <div className="tab-body">
      <p className="muted">From the smallest thing up. Click one, or click the byte or RAM in the scene.</p>
      <div className="seg wrap" role="group" aria-label="Parts">
        {PARTS.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.id === selected} onClick={() => selectPart(p.id)}>
            {p.name}
          </button>
        ))}
      </div>
      {part ? (
        <div className="part-card">
          <span className="eyebrow">{part.analogy}</span>
          <h3>{part.name}</h3>
          <p>{part.what}</p>
          <p className="spec">{part.spec(v)}</p>
        </div>
      ) : (
        <div className="part-card empty">
          <p>Start with the memory cell: it’s the switch everything else is built from.</p>
        </div>
      )}
    </div>
  );
}

export function Run() {
  const v = useLab((s) => s.byteValue);
  const target = useLab((s) => s.target);
  const wins = useLab((s) => s.wins);
  const set = useLab((s) => s.set);
  const [nBits, setNBits] = useState(8);
  const bits = toBits(v);
  const places = placeValues(8);
  const solved = target !== null && v === target;

  const flip = (i: number) => {
    const next = flipBit(v, i);
    set({ byteValue: next, ...(target !== null && next === target ? { wins: wins + 1 } : {}) });
  };
  const newTarget = () => {
    let t = v;
    while (t === v) t = 1 + Math.floor(Math.random() * 255);
    set({ target: t });
  };

  return (
    <div className="tab-body run">
      <div className="byte-readout" aria-live="polite">
        <span className="big-binary">{binaryString(v)}</span>
        <span className="eq">=</span>
        <span className="big-dec">{v}</span>
      </div>

      <div className="switch-row" role="group" aria-label="The 8 switches of the byte">
        {bits.map((b, i) => (
          <button
            key={i}
            type="button"
            className={`bit${b ? ' on' : ''}`}
            aria-pressed={b === 1}
            aria-label={`Switch worth ${places[i]}, ${b ? 'on' : 'off'}`}
            onClick={() => flip(i)}
          >
            <span className="bit-val">{b}</span>
            <span className="bit-place">{places[i]}</span>
          </button>
        ))}
      </div>
      <p className="explain">
        {v === 0 ? 'Every switch is off, so the byte stores 0.' : `The switches that are on are worth ${sumOfPlaces(v)}. Add them up: ${v}.`}
      </p>

      <div className="row">
        <button type="button" onClick={() => set({ byteValue: 0 })}>
          All off
        </button>
        <button type="button" onClick={() => set({ byteValue: 255 })}>
          All on
        </button>
        <button type="button" className="primary" onClick={newTarget}>
          {target === null ? 'Give me a target' : 'New target'}
        </button>
      </div>
      {target !== null && (
        <div className={`target ${solved ? 'solved' : ''}`} aria-live="polite">
          {solved ? (
            <>
              <strong>You built {target}!</strong> That’s {sumOfPlaces(target)}. Targets solved: {wins}
            </>
          ) : (
            <>
              Build the number <strong className="num">{target}</strong> using the switches. Hint: start with the biggest switch that fits.
            </>
          )}
        </div>
      )}

      <div className="field more-bits">
        <label htmlFor="nbits">
          What if we had more switches? <span className="num">{nBits} bits</span>
        </label>
        <input id="nbits" type="range" min={1} max={32} value={nBits} onChange={(e) => setNBits(+e.target.value)} />
        <p className="explain">
          {nBits} switch{nBits > 1 ? 'es' : ''} can store <b className="num">{readable(valuesFor(nBits))}</b> different values (0 to{' '}
          {readable(maxValue(nBits))}). Each extra switch doubles it.
        </p>
      </div>
    </div>
  );
}

export function MathTab() {
  const v = useLab((s) => s.byteValue);
  const [params, setParams] = useState('7');
  const [bytesPer, setBytesPer] = useState(2);
  const gb = modelGB(parseFloat(params) || 0, bytesPer);

  return (
    <div className="tab-body">
      <h3>How many values can n bits hold?</h3>
      <div className="formula" role="math" aria-label="Number of values equals 2 multiplied by itself n times">
        <span>values</span>
        <span className="eq">=</span>
        <span>2 × 2 × … × 2</span>
        <span className="muted">(once per bit, written 2ⁿ)</span>
      </div>
      <p>So 8 bits give 2⁸ = 256 values: every whole number from 0 to 255.</p>

      <h3>Reading your byte</h3>
      <ol className="working">
        <li>
          Pattern: <b className="mem">{binaryString(v)}</b>
        </li>
        <li>Switches that are on are worth: {sumOfPlaces(v)}</li>
        <li>
          Add them up: <b>{v}</b>
        </li>
      </ol>

      <h3>From bytes to gigabytes</h3>
      <table className="units">
        <tbody>
          <tr>
            <td>1 byte</td>
            <td className="num">8 bits</td>
          </tr>
          <tr>
            <td>1 KB (kilobyte)</td>
            <td className="num">1,000 bytes</td>
          </tr>
          <tr>
            <td>1 MB (megabyte)</td>
            <td className="num">1,000,000 bytes</td>
          </tr>
          <tr>
            <td>1 GB (gigabyte)</td>
            <td className="num">1,000,000,000 bytes</td>
          </tr>
        </tbody>
      </table>
      <p className="muted">Some tools count in steps of 1,024 instead of 1,000 (written KiB, MiB, GiB). The difference is small; this course uses 1,000.</p>

      <h3>How much memory does a model need?</h3>
      <p>Every weight is stored in bytes. So: number of weights × bytes per weight.</p>
      <div className="calc">
        <label>
          <span>Weights (billions)</span>
          <input type="number" min={0} step="0.5" value={params} onChange={(e) => setParams(e.target.value)} />
        </label>
        <span className="eq">×</span>
        <div className="field">
          <span className="flabel" id="bpw">
            Bytes per weight
          </span>
          <div className="seg" role="group" aria-labelledby="bpw">
            {[2, 1, 0.5].map((b) => (
              <button key={b} type="button" aria-pressed={b === bytesPer} onClick={() => setBytesPer(b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <span className="eq">=</span>
        <output className="num big">{gb ? `${gb} GB` : '–'}</output>
      </div>
      <p className={`chip ${gb > 0 && gb <= 5 ? 'good' : 'bad'}`} style={{ alignSelf: 'flex-start' }}>
        {gb <= 0 ? 'Enter a size' : gb <= 5 ? 'Fits in the ~5 GB your laptop has free' : 'Too big for the ~5 GB your laptop has free'}
      </p>
      <p className="muted">Fewer bytes per weight means a smaller model. You’ll see how that works in Lesson 19, quantization.</p>
    </div>
  );
}
