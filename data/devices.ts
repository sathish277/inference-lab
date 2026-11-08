// Real devices the lessons can simulate.
// Every number on screen comes from here, so each device lists where its numbers come from.
// "Derived" means calculated from the spec sheet: for RAM, bandwidth = transfers per second × bytes per transfer × channels.

export type Source = { label: string; url?: string };

export type Device = {
  id: string;
  name: string;
  memoryType: string;
  bandwidthGBs: number; // how many GB per second memory can feed the processor
  tflops: number; // trillions of math operations per second (rough, real-world for AI work)
  ramGB: number; // total memory
  usableGB: number; // what is realistically free for a model
  spillGBs: number; // speed of the slower place the model spills to when it doesn't fit
  spillName: string;
  note: string;
  sources: Source[];
};

export const DEVICES: Device[] = [
  {
    id: 'laptop-dual',
    name: 'Your laptop · two RAM sticks',
    memoryType: 'DDR4-3200, dual channel',
    bandwidthGBs: 51.2,
    tflops: 2,
    ramGB: 8,
    usableGB: 5,
    spillGBs: 2,
    spillName: 'the SSD',
    note: 'Intel i5 with Iris Xe graphics. Two RAM sticks work side by side, which doubles the lanes to the processor. About 5 GB is free for a model after Windows and your apps.',
    sources: [
      { label: 'Derived: 3,200 million transfers/s × 8 bytes × 2 channels = 51.2 GB/s' },
      { label: 'Compute is an approximate real-world figure for Iris Xe (96 execution units)' },
    ],
  },
  {
    id: 'laptop-single',
    name: 'Your laptop · one RAM stick',
    memoryType: 'DDR4-3200, single channel',
    bandwidthGBs: 25.6,
    tflops: 2,
    ramGB: 8,
    usableGB: 5,
    spillGBs: 2,
    spillName: 'the SSD',
    note: 'The same laptop with a single stick. Many 8 GB laptops ship this way. Half the lanes means half the speed.',
    sources: [{ label: 'Derived: 3,200 million transfers/s × 8 bytes × 1 channel = 25.6 GB/s' }],
  },
  {
    id: 'phone',
    name: 'Flagship phone (2024)',
    memoryType: 'LPDDR5X',
    bandwidthGBs: 76.8,
    tflops: 10,
    ramGB: 12,
    usableGB: 6,
    spillGBs: 1.5,
    spillName: 'phone storage',
    note: 'Memory is shared with the whole phone, so only about half is safe to use for a model. Compute is from the phone’s AI accelerator (NPU).',
    sources: [
      { label: 'Derived: 4,800 million transfers/s × 16 bytes (64-bit bus) = 76.8 GB/s' },
      { label: 'NPU compute is approximate' },
    ],
  },
  {
    id: 'mac-m3pro',
    name: 'MacBook Pro (M3 Pro)',
    memoryType: 'Unified LPDDR5',
    bandwidthGBs: 150,
    tflops: 7,
    ramGB: 18,
    usableGB: 12,
    spillGBs: 5,
    spillName: 'the SSD',
    note: 'Memory sits right beside the chip and is shared by the CPU and GPU. This is why Macs are popular for local AI.',
    sources: [
      {
        label: 'Apple: M3 Pro has 150 GB/s memory bandwidth',
        url: 'https://www.apple.com/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/',
      },
      { label: 'GPU compute is approximate' },
    ],
  },
  {
    id: 'rtx4090',
    name: 'RTX 4090 gaming GPU',
    memoryType: 'GDDR6X',
    bandwidthGBs: 1008,
    tflops: 165,
    ramGB: 24,
    usableGB: 22,
    spillGBs: 25,
    spillName: 'system RAM over PCIe',
    note: 'The fastest memory you can buy in a gaming PC. If a model doesn’t fit in 24 GB, it spills to system RAM over the much slower PCIe link.',
    sources: [
      { label: 'NVIDIA RTX 4090 specifications', url: 'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/' },
      { label: 'Compute: FP16 tensor throughput, dense, approximate' },
    ],
  },
  {
    id: 'h100',
    name: 'H100 datacenter GPU',
    memoryType: 'HBM3',
    bandwidthGBs: 3350,
    tflops: 990,
    ramGB: 80,
    usableGB: 76,
    spillGBs: 25,
    spillName: 'system RAM over PCIe',
    note: 'Memory chips are stacked right next to the processor. Built to serve many users at once.',
    sources: [
      { label: 'NVIDIA H100 SXM: 3.35 TB/s, 80 GB', url: 'https://www.nvidia.com/en-us/data-center/h100/' },
      { label: 'Compute: FP16 tensor throughput, dense, approximate' },
    ],
  },
];

export const MODEL_SIZES_B = [1, 3, 7, 8, 13, 70];
export const PRECISIONS = [16, 8, 4];
export const BATCH_STEPS = [1, 2, 4, 8, 16, 32, 64, 128, 256];

export function getDevice(id: string): Device {
  const d = DEVICES.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown device: ${id}`);
  return d;
}
