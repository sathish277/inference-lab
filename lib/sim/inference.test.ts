import { describe, expect, it } from 'vitest';
import { getDevice } from '@/data/devices';
import { modelSizeGB, simulate } from './inference';

const laptop = getDevice('laptop-dual');

describe('modelSizeGB', () => {
  it('7B at 4-bit is 3.5 GB', () => expect(modelSizeGB(7, 4)).toBe(3.5));
  it('7B at 16-bit is 14 GB', () => expect(modelSizeGB(7, 16)).toBe(14));
});

describe('the memory wall on your laptop', () => {
  const r = simulate({ device: laptop, paramsB: 7, bits: 4, batch: 1 });

  it('reads 3.5 GB in about 68 ms', () => expect(r.readTimeS * 1000).toBeCloseTo(68.36, 1));
  it('does the math in 7 ms', () => expect(r.computeTimeS * 1000).toBeCloseTo(7, 5));
  it('is limited by memory', () => expect(r.bottleneck).toBe('memory'));
  it('has a ceiling of about 14.6 tokens/s', () => expect(r.ceilingTokPerUser).toBeCloseTo(14.63, 1));
  it('realistically runs about 8.8 tokens/s', () => expect(r.realisticTokPerUser).toBeCloseTo(8.78, 1));
  it('leaves the processor idle about 90% of the time', () => expect(r.idleFraction).toBeCloseTo(0.9, 1));
});

describe('quiz answers hold', () => {
  it('8-bit halves the speed of 4-bit (when both fit)', () => {
    const mac = getDevice('mac-m3pro');
    const q4 = simulate({ device: mac, paramsB: 7, bits: 4, batch: 1 });
    const q8 = simulate({ device: mac, paramsB: 7, bits: 8, batch: 1 });
    expect(q8.realisticTokPerUser / q4.realisticTokPerUser).toBeCloseTo(0.5, 5);
  });

  it('2× compute barely changes a memory-bound laptop', () => {
    const faster = { ...laptop, tflops: laptop.tflops * 2 };
    const a = simulate({ device: laptop, paramsB: 7, bits: 4, batch: 1 });
    const b = simulate({ device: faster, paramsB: 7, bits: 4, batch: 1 });
    expect(b.realisticTokPerUser).toBeCloseTo(a.realisticTokPerUser, 5);
  });

  it('a second RAM stick doubles speed', () => {
    const one = simulate({ device: getDevice('laptop-single'), paramsB: 7, bits: 4, batch: 1 });
    const two = simulate({ device: laptop, paramsB: 7, bits: 4, batch: 1 });
    expect(two.realisticTokPerUser / one.realisticTokPerUser).toBeCloseTo(2, 5);
  });

  it('13B at 8-bit does not fit in 8 GB and drops below 1 token/s', () => {
    const r = simulate({ device: laptop, paramsB: 13, bits: 8, batch: 1 });
    expect(r.fits).toBe(false);
    expect(r.realisticTokPerUser).toBeLessThan(1);
  });

  it('an H100 serves 64 users at nearly the speed of one', () => {
    const h100 = getDevice('h100');
    const one = simulate({ device: h100, paramsB: 70, bits: 8, batch: 1 });
    const many = simulate({ device: h100, paramsB: 70, bits: 8, batch: 64 });
    expect(many.realisticTokPerUser / one.realisticTokPerUser).toBeGreaterThan(0.9);
    expect(many.realisticTotalTok).toBeGreaterThan(one.realisticTotalTok * 50);
  });

  it('a big enough batch makes compute the bottleneck', () => {
    const h100 = getDevice('h100');
    const r = simulate({ device: h100, paramsB: 7, bits: 4, batch: 256 });
    expect(r.bottleneck).toBe('compute');
  });
});
