// Lesson 13 content. Text lives here, separate from the components, so lessons are quick to write and edit.

import type { LessonContent } from '@/content/types';

export const memoryWall: LessonContent = {
  slug: 'the-memory-wall',
  title: 'The memory wall',
  hook: 'Your laptop can do about 2 trillion math operations every second. So why does it write only about 9 words a second?',
  predict: {
    question:
      'Take a 7B model squeezed to 4 bits per weight (half a byte each). Your laptop’s RAM can move about 51 GB per second. What’s the most tokens per second your laptop could ever produce?',
    hint: 'First work out how many GB the processor must read for one token. Then ask: how many times per second can RAM deliver that much?',
    unit: 'tokens/s',
    answerLow: 8,
    answerHigh: 16,
    tooHigh: 'is too high. RAM can’t deliver the model that often.',
    tooLow: 'is too low. The laptop can do better than that.',
    working: [
      'Model size = 7 billion × 0.5 byte = 3.5 GB',
      'Ceiling = 51.2 GB/s ÷ 3.5 GB = about 14.6 tokens per second',
      'Real tools reach about 60% of that, so about 9 tokens per second',
    ],
    takeaway: 'You didn’t need the processor’s speed at all. That’s the whole lesson.',
  },
  overview: [
    'A model is a giant list of numbers called weights. A 7B model has 7 billion of them, sitting in your RAM.',
    'To write one new word (a token), the processor has to use every single weight once. So for every token, the whole model travels from RAM to the processor.',
    'The processor is very fast. The road from RAM to the processor is not. So the processor spends most of its time waiting. This is called the memory wall.',
  ],
  tryThis: [
    'Click “Look inside” and watch the RAM chips light up one by one. One full sweep is one token.',
    'Switch to “one RAM stick” and watch the text slow to half speed.',
    'Pick 13B at 8-bit on your laptop. Watch everything turn red.',
  ],
  quiz: [
    {
      q: 'Your 7B model runs at 4-bit on your laptop. You switch it to 8-bit. What happens to tokens per second?',
      options: ['It roughly doubles', 'It roughly halves', 'It stays about the same', 'It drops to a quarter'],
      answer: 1,
      hint: '8-bit means each weight takes twice the bytes. What does that do to the GB read per token?',
      why: 'The model doubles from 3.5 GB to 7 GB. RAM speed stays the same, so each token takes twice as long to read: half the speed. On an 8 GB laptop it also stops fitting, which makes it far worse.',
    },
    {
      q: 'You swap your processor for one that does 2× more math per second, with the same RAM. Speed for one user?',
      options: ['About 2× faster', 'About the same', 'Slower', 'About 4× faster'],
      answer: 1,
      hint: 'Look at the two bars in “Watch it run” for your laptop. Which one is longer?',
      why: 'The processor was already waiting on memory most of the time. Doubling its speed only makes it wait longer. The reading time doesn’t change.',
    },
    {
      q: 'Your laptop has one 8 GB RAM stick. What’s the cheapest upgrade that speeds up local models the most?',
      options: ['A faster SSD', 'Adding a second, matching RAM stick', 'A better cooler', 'Closing the browser'],
      answer: 1,
      hint: 'Switch the device between “one RAM stick” and “two RAM sticks”. What changes?',
      why: 'Two sticks run in dual-channel mode, doubling the lanes from RAM to the processor: 25.6 → 51.2 GB/s. That doubles tokens per second, and adds room for bigger models.',
    },
    {
      q: 'Why can an H100 serve 64 users at almost the same per-user speed as one?',
      options: [
        'It keeps 64 copies of the model',
        'Each weight read from memory is reused for all 64 users in the same step',
        'It skips layers when busy',
        'Users take turns',
      ],
      answer: 1,
      hint: 'Pick the H100 and slide “users at once” from 1 to 64. Watch the amber bar.',
      why: 'Weights are read once per step no matter how many users there are. Each extra user only adds math, and the H100 has lots of spare math. That’s batching, and it’s the main reason cloud AI is cheap per user.',
    },
    {
      q: 'You load a 13B model at 8-bit (13 GB) on your 8 GB laptop. What happens?',
      options: [
        'It runs a bit slower than a 7B',
        'It won’t fit, so it keeps re-reading from the SSD and becomes extremely slow',
        'It runs faster because it’s smarter',
        'The processor becomes the bottleneck',
      ],
      answer: 1,
      hint: 'Compare 13 GB with the free RAM. Where does the rest have to come from on every token?',
      why: 'Only about 5 GB is free, so most of the model streams from the SSD at about 2 GB/s on every token. That’s well under 1 token per second. Use 4-bit or a smaller model.',
    },
  ],
  doneWhen: [
    'You can say in one sentence why memory bandwidth, not processor speed, limits tokens per second for one user.',
    'You can work out the ceiling for any model and device by hand: bandwidth ÷ model size.',
    'You can explain why 4-bit runs about twice as fast as 8-bit.',
    'You can explain why servers batch users together, and why your laptop can’t use that trick.',
  ],
  next: { n: 15, title: 'The KV cache', question: 'Why do long chats slow down?' },
};
