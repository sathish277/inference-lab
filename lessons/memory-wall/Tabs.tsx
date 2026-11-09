'use client';
// Lesson 13 tabs: Parts, Watch it run, The math.

import { useMemo, useState } from 'react';
import { useLab } from '@/store/lab';
import { BATCH_STEPS, DEVICES, MODEL_SIZES_B, PRECISIONS, getDevice } from '@/data/devices';
import { fmtNum, fmtTime, simulate } from '@/lib/sim/inference';
import { PARTS } from './parts';

function useSim() {
  const { deviceId, paramsB, bits, batch } = useLab();
  const device = getDevice(deviceId);
  const r = useMemo(() => simulate({ device, paramsB, bits, batch }), [device, paramsB, bits, batch]);
  return { device, r, paramsB, bits, batch };
}

export function Parts() {
  const { device, r } = useSim();
  const selected = useLab((s) => s.selectedPart);
  const selectPart = useLab((s) => s.selectPart);
  const part = PARTS.find((p) => p.id === selected);
  return (
    <div className="tab-body">
      <p className="muted">Click any part in the scene, or pick one here.</p>
      <div className="seg wrap" role="group" aria-label="Parts">
        {PARTS.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.id === selected} onClick={() => selectPart(p.id)}>
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>
      {part ? (
        <div className="part-card">
          <span className="eyebrow">{part.analogy}</span>
          <h3>{part.name}</h3>
          <p>{part.what}</p>
          <p className="spec">{part.spec(device, r)}</p>
        </div>
      ) : (
        <div className="part-card empty">
          <p>Nothing selected yet. Start with the RAM: it holds the model.</p>
        </div>
      )}
    </div>
  );
}

export function Run() {
  const { device, r, paramsB, bits, batch } = useSim();
  const set = useLab((s) => s.set);
  const output = useLab((s) => s.output);
  const tokenCount = useLab((s) => s.tokenCount);
  const max = Math.max(r.readTimeS, r.computeTimeS);
  const memBound = r.bottleneck === 'memory';
  const batchIndex = BATCH_STEPS.indexOf(batch);

  return (
    <div className="tab-body run">
      <div className="field">
        <label htmlFor="mw-device">Device</label>
        <select id="mw-device" value={device.id} onChange={(e) => set({ deviceId: e.target.value })}>
          {DEVICES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="note">{device.note}</span>
      </div>
      <div className="field">
        <span className="flabel" id="mw-model-label">
          Model size
        </span>
        <div className="seg" role="group" aria-labelledby="mw-model-label">
          {MODEL_SIZES_B.map((m) => (
            <button key={m} type="button" aria-pressed={m === paramsB} onClick={() => set({ paramsB: m })}>
              {m}B
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="flabel" id="mw-bits-label">
          Precision (bits per weight)
        </span>
        <div className="seg" role="group" aria-labelledby="mw-bits-label">
          {PRECISIONS.map((b) => (
            <button key={b} type="button" aria-pressed={b === bits} onClick={() => set({ bits: b })}>
              {b}-bit
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="mw-batch">
          Users served at once: <span className="num">{batch}</span>
        </label>
        <input
          id="mw-batch"
          type="range"
          min={0}
          max={BATCH_STEPS.length - 1}
          step={1}
          value={batchIndex}
          onChange={(e) => set({ batch: BATCH_STEPS[+e.target.value] })}
        />
        <span className="note">On your laptop this is 1: just you. Servers answer many people in the same step.</span>
      </div>

      <div className="chips" aria-live="polite">
        <span className={`chip ${r.fits ? 'good' : 'bad'}`}>{r.fits ? 'Fits in memory' : `Doesn’t fit · reading from ${device.spillName}`}</span>
        <span className={`chip ${memBound ? 'mem' : 'cpu'}`}>{memBound ? 'Limited by memory' : 'Limited by compute'}</span>
      </div>

      <div className="tiles">
        <div className="tile">
          <span className="k">Model size</span>
          <span className="v mem">{fmtNum(r.sizeGB)} GB</span>
        </div>
        <div className="tile">
          <span className="k">Tokens/s for you</span>
          <span className="v">{fmtNum(r.realisticTokPerUser)}</span>
        </div>
        <div className="tile">
          <span className="k">Tokens/s, all users</span>
          <span className="v">{fmtNum(r.realisticTotalTok)}</span>
        </div>
      </div>

      <div className="bars">
        <div className="bar-row">
          <span className="mem">Reading weights</span>
          <div className="track">
            <div className="fill mem" style={{ width: `${(r.readTimeS / max) * 100}%` }} />
          </div>
          <span className="num">{fmtTime(r.readTimeS)}</span>
        </div>
        <div className="bar-row">
          <span className="cpu">Doing the math</span>
          <div className="track">
            <div className="fill cpu" style={{ width: `${(r.computeTimeS / max) * 100}%` }} />
          </div>
          <span className="num">{fmtTime(r.computeTimeS)}</span>
        </div>
      </div>

      <p className="explain">
        {!r.fits
          ? `The model needs ${fmtNum(r.sizeGB)} GB but only about ${device.usableGB} GB is free, so part of it keeps being re-read from ${device.spillName} at about ${fmtNum(device.spillGBs)} GB/s. Try 4-bit or a smaller model.`
          : memBound
            ? `The processor finishes its math, then sits idle about ${Math.round(r.idleFraction * 100)}% of the time waiting for weights. A faster processor would barely help. Faster memory or a smaller model would.`
            : `With ${batch} users sharing each read, the math now takes longer than the reading. This is why data centers batch requests. Your laptop serves only you, so it stays memory-limited.`}
      </p>

      <div className="live">
        <div className="live-head">
          <span>Live output</span>
          <span className="num">{tokenCount.toLocaleString('en-US')} tokens</span>
        </div>
        <p className="live-text">
          {output}
          <span className="cursor" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}

export function MathTab() {
  const { device, r, paramsB, bits, batch } = useSim();
  const [sizeIn, setSizeIn] = useState('3.5');
  const [bwIn, setBwIn] = useState('51.2');
  const ceiling = parseFloat(bwIn) / parseFloat(sizeIn);

  return (
    <div className="tab-body">
      <h3>The one formula</h3>
      <div className="formula" role="math" aria-label="Most tokens per second equals memory bandwidth divided by model size">
        <span>most tokens per second</span>
        <span className="eq">=</span>
        <span className="frac">
          <span className="mem">memory bandwidth (GB/s)</span>
          <span className="bar" />
          <span className="mem">model size (GB)</span>
        </span>
      </div>
      <p>Model size is just parameters × bytes per weight. At 4-bit, each weight is half a byte.</p>

      <h3>Your current setup, worked through</h3>
      <ol className="working">
        <li>
          Model size = {paramsB} billion × {bits / 8} byte = <b className="mem">{fmtNum(r.sizeGB)} GB</b>
        </li>
        <li>
          Read time = {fmtNum(r.sizeGB)} GB ÷ {fmtNum(r.effectiveBandwidthGBs)} GB/s = <b className="mem">{fmtTime(r.readTimeS)}</b>
        </li>
        <li>
          Math time = 2 × {paramsB} billion × {batch} user{batch > 1 ? 's' : ''} ÷ {fmtNum(device.tflops)} trillion/s ={' '}
          <b className="cpu">{fmtTime(r.computeTimeS)}</b>
        </li>
        <li>
          The slower one wins: {fmtTime(r.stepTimeS)} per token → ceiling <b>{fmtNum(r.ceilingTokPerUser)} tokens/s</b>
        </li>
        <li>
          Real tools reach about 60% → <b>{fmtNum(r.realisticTokPerUser)} tokens/s</b>
        </li>
      </ol>
      <p className="muted">
        Why “2 ×”? Each weight is used in one multiply and one add, for each user.
      </p>

      <h3>Try your own numbers</h3>
      <div className="calc">
        <label>
          <span>Model size (GB)</span>
          <input type="number" min={0} step="0.1" value={sizeIn} onChange={(e) => setSizeIn(e.target.value)} />
        </label>
        <span className="eq">÷</span>
        <label>
          <span>Bandwidth (GB/s)</span>
          <input type="number" min={0} step="1" value={bwIn} onChange={(e) => setBwIn(e.target.value)} />
        </label>
        <span className="eq">=</span>
        <output className="num big">{Number.isFinite(ceiling) && ceiling > 0 ? `${fmtNum(ceiling)} tok/s` : '–'}</output>
      </div>

      <div className="real-world">
        <span className="eyebrow">Real world · {device.name}</span>
        <ul>
          {device.sources.map((s) =>
            s.url ? (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ) : (
              <li key={s.label}>{s.label}</li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

