// The full course map. A lesson with a `slug` is built and clickable; the rest show as "coming soon".

export type LessonRef = { n: number; title: string; question: string; slug?: string; free?: boolean };
export type Module = { id: string; title: string; blurb: string; free?: boolean; lessons: LessonRef[] };

export const COURSE: Module[] = [
  {
    id: 'm1',
    title: 'How a computer works',
    blurb: 'Bits, the processor, and the ladder of memory speeds. No background needed.',
    free: true,
    lessons: [
      { n: 1, title: 'Bits and bytes', question: 'How does a number live inside a chip?', slug: 'bits-and-bytes', free: true },
      { n: 2, title: 'The multiply-add', question: 'What does a processor actually do?', free: true },
      { n: 3, title: 'The speed ladder', question: 'Why are there so many kinds of memory?', free: true },
      { n: 4, title: 'Bandwidth vs latency', question: 'Is a wide road or a short road better?', free: true },
      { n: 5, title: 'CPU vs GPU vs NPU', question: 'Why do GPUs win at AI?', free: true },
    ],
  },
  {
    id: 'm2',
    title: 'What a model is',
    blurb: 'Weights, matrix multiply, tokens and the transformer, seen from the inside.',
    lessons: [
      { n: 6, title: 'Weights are just numbers', question: 'What’s inside a model file?' },
      { n: 7, title: 'Matrix multiply', question: 'How do weights turn input into output?' },
      { n: 8, title: 'Tokens', question: 'How does text become numbers?' },
      { n: 9, title: 'Embeddings', question: 'How does a token get meaning?' },
      { n: 10, title: 'One transformer layer', question: 'What are attention and the MLP?' },
      { n: 11, title: 'Picking the next word', question: 'How does the model choose?' },
    ],
  },
  {
    id: 'm3',
    title: 'Running a model',
    blurb: 'What really happens between pressing Run and seeing words.',
    lessons: [
      { n: 12, title: 'Loading the model', question: 'What happens when you press Run?' },
      { n: 13, title: 'The memory wall', question: 'Why is my laptop slow at writing text?', slug: 'the-memory-wall', free: true },
      { n: 14, title: 'Prefill vs decode', question: 'Why is reading the prompt fast but writing slow?' },
      { n: 15, title: 'The KV cache', question: 'Why do long chats slow down?' },
      { n: 16, title: 'Context length', question: 'How much memory does a long prompt eat?' },
      { n: 17, title: 'The roofline', question: 'Memory-bound or compute-bound?' },
    ],
  },
  {
    id: 'm4',
    title: 'Making it fit and fast',
    blurb: 'Quantization, batching and the tricks every inference engine uses.',
    lessons: [
      { n: 18, title: 'Number formats', question: 'What are FP16, BF16, INT8 and INT4?' },
      { n: 19, title: 'Quantization', question: 'How do you shrink a model without breaking it?' },
      { n: 20, title: 'Real quant formats', question: 'What do GGUF and Q4_K_M mean?' },
      { n: 21, title: 'Batching', question: 'How do servers serve thousands of users cheaply?' },
      { n: 22, title: 'Speculative decoding', question: 'Can a small model speed up a big one?' },
      { n: 23, title: 'FlashAttention', question: 'Why does attention waste memory traffic?' },
      { n: 24, title: 'Paged KV cache', question: 'How does vLLM fit more users?' },
    ],
  },
  {
    id: 'm5',
    title: 'Hardware deep dive',
    blurb: 'Inside GPUs, memory chips, Macs and phones.',
    lessons: [
      { n: 25, title: 'Inside a GPU', question: 'What are SMs, warps and tensor cores?' },
      { n: 26, title: 'Memory types', question: 'DDR, LPDDR, GDDR, HBM: what’s the difference?' },
      { n: 27, title: 'Unified memory', question: 'Why are Macs good at local AI?' },
      { n: 28, title: 'Phones and NPUs', question: 'How does AI run on a phone?' },
      { n: 29, title: 'Power and heat', question: 'What does a token cost in watts?' },
      { n: 30, title: 'Many GPUs', question: 'How do you split a 400B model?' },
    ],
  },
  {
    id: 'm6',
    title: 'Capstone: your own machine',
    blurb: 'Measure your own laptop, pick hardware, and ship a local AI app.',
    lessons: [
      { n: 31, title: 'Benchmark your laptop', question: 'Does reality match the prediction?' },
      { n: 32, title: 'Pick hardware for a budget', question: 'What should I buy for my use case?' },
      { n: 33, title: 'Ship a local AI app', question: 'How do I use this in a product?' },
    ],
  },
];

export const TOTAL_LESSONS = COURSE.reduce((n, m) => n + m.lessons.length, 0);

export function findLesson(slug: string) {
  for (const m of COURSE) {
    const l = m.lessons.find((x) => x.slug === slug);
    if (l) return { module: m, lesson: l, moduleIndex: COURSE.indexOf(m) };
  }
  return null;
}
