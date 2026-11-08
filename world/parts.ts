// What each part of the laptop is, in plain words. Shown in the Parts tab when a learner clicks a part.
// `spec` reads the chosen device, so the numbers always match the knobs.

import type { Device } from '@/data/devices';
import type { SimResult } from '@/lib/sim/inference';
import { fmtNum } from '@/lib/sim/inference';
import type { PartId } from '@/store/lab';

export type PartInfo = {
  id: PartId;
  name: string;
  analogy: string;
  what: string;
  spec: (d: Device, r: SimResult) => string;
};

export const PARTS: PartInfo[] = [
  {
    id: 'ssd',
    name: 'SSD (storage)',
    analogy: 'The warehouse',
    what: 'Keeps the model file when the power is off. It’s big but slow, so it’s only meant to be used once, to load the model into RAM. If the model doesn’t fit in RAM, the computer keeps going back to the warehouse, and everything slows to a crawl.',
    spec: (d) => `When the model doesn’t fit, it’s re-read from ${d.spillName} at about ${fmtNum(d.spillGBs)} GB/s.`,
  },
  {
    id: 'ram',
    name: 'RAM (memory)',
    analogy: 'The kitchen counter',
    what: 'Holds the whole model while it runs. In the scene, the 16 chips stand for 16 slices of the model. Watch them light up in order: that’s the processor reading every slice to make one token.',
    spec: (d, r) => `${d.ramGB} GB of ${d.memoryType}, about ${d.usableGB} GB free for a model. This model needs ${fmtNum(r.sizeGB)} GB.`,
  },
  {
    id: 'bus',
    name: 'Memory bus',
    analogy: 'The road between counter and chef',
    what: 'The wires that carry data from RAM to the processor. How much it can carry per second is called bandwidth. For writing text, this road is almost always the bottleneck.',
    spec: (d) => `Bandwidth: ${fmtNum(d.bandwidthGBs)} GB per second.`,
  },
  {
    id: 'processor',
    name: 'Processor (CPU + GPU)',
    analogy: 'The chef',
    what: 'Does the math: multiply, then add, billions of times per token. The 16 squares are its cores. Teal means working; dark means waiting for weights to arrive.',
    spec: (d, r) =>
      `About ${fmtNum(d.tflops)} trillion operations per second. Busy ${Math.round(r.busyFraction * 100)}% of each step, waiting the rest.`,
  },
  {
    id: 'screen',
    name: 'Screen',
    analogy: 'The plate',
    what: 'Where the words appear. They come out at the real speed the chosen device would manage.',
    spec: (_d, r) => `${fmtNum(r.realisticTokPerUser)} tokens per second for you.`,
  },
];
