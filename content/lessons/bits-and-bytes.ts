// Lesson 1 content: bits and bytes. The very first lesson, so it assumes nothing.

import type { LessonContent } from '@/content/types';

export const bitsAndBytes: LessonContent = {
  slug: 'bits-and-bytes',
  title: 'Bits and bytes',
  hook: 'Every AI model is just billions of numbers. But a chip can’t write a “7”. All it has are tiny switches that are either off or on. So how does a number live inside a chip?',
  predict: {
    question:
      'One switch can be off or on: that’s 2 possibilities. Now put 8 switches in a row. How many different on/off patterns can that row make?',
    hint: 'Start small. 1 switch gives 2 patterns. 2 switches give 4: off-off, off-on, on-off, on-on. What happens to the count every time you add one more switch?',
    unit: 'patterns',
    answerLow: 256,
    answerHigh: 256,
    tooHigh: 'is too many. Try doubling 2, eight times.',
    tooLow: 'is too few. Every extra switch doubles the count.',
    working: [
      '1 switch: 2 patterns (off, on)',
      '2 switches: 2 × 2 = 4 patterns',
      'Each extra switch doubles the count',
      '8 switches: 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 patterns',
    ],
    takeaway:
      'So a row of 8 switches can store any whole number from 0 to 255. That row has a name: a byte.',
  },
  overview: [
    'A chip can’t store a “7” or a letter. Inside, it only has tiny switches, and each one is either off or on. We write off as 0 and on as 1. One switch is called a bit.',
    'Put 8 switches in a row and you get a byte. Each switch has a value: 128, 64, 32, 16, 8, 4, 2 and 1. To read the number, add up the values of the switches that are on.',
    'Your laptop’s 8 GB of RAM is about 8 billion bytes, which is 64 billion switches. Every AI model you run is stored in exactly these switches.',
  ],
  tryThis: [
    'Click “Look inside”. A byte from one RAM chip floats above the laptop. Click its switches to flip them.',
    'Turn every switch on. What number do you get?',
    'Open “Play with it” and press “Give me a target”. Build that number with the switches.',
  ],
  quiz: [
    {
      q: 'How many different values can 4 bits hold?',
      options: ['4', '8', '16', '32'],
      answer: 2,
      hint: 'Start at 2 for one bit, then double for each extra bit.',
      why: '2 × 2 × 2 × 2 = 16. Four switches can store any number from 0 to 15.',
    },
    {
      q: 'Which number does the byte 0000 0101 store?',
      options: ['101', '5', '6', '4'],
      answer: 1,
      hint: 'The last three switches have the values 4, 2 and 1. Which ones are on?',
      why: 'The 4 switch and the 1 switch are on: 4 + 1 = 5. Binary looks like decimal, but it isn’t: 101 in switches means 5.',
    },
    {
      q: 'What’s the biggest number one byte can store?',
      options: ['256', '255', '128', '8'],
      answer: 1,
      hint: 'Turn every switch on and add up all the values.',
      why: '128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. A byte has 256 patterns, but one of them is 0, so the top is 255.',
    },
    {
      q: 'An AI model has 7 billion weights, and each weight takes 2 bytes. How much memory does it need?',
      options: ['7 GB', '14 GB', '3.5 GB', '56 GB'],
      answer: 1,
      hint: '1 GB is 1 billion bytes. Multiply the number of weights by the bytes each one takes.',
      why: '7 billion × 2 bytes = 14 billion bytes = 14 GB. That’s more than your laptop has free. Later you’ll learn how to shrink it.',
    },
    {
      q: 'You go from 8 bits to 16 bits. How many values can you store now?',
      options: ['512 (double)', '65,536', '16', '2,048'],
      answer: 1,
      hint: 'Each extra bit doubles the count. You’re adding 8 more bits.',
      why: 'Doubling 256 eight more times gives 256 × 256 = 65,536. Adding bits makes the count explode, which is why bits matter so much for AI models.',
    },
  ],
  doneWhen: [
    'You can say what a bit and a byte are, in one sentence each.',
    'You can read any byte, like 0010 0101, as a normal number.',
    'You can work out how many values n bits can hold: 2 multiplied by itself n times.',
    'You can work out how much memory a model needs: number of weights × bytes per weight.',
  ],
  next: { n: 2, title: 'The multiply-add', question: 'What does a processor actually do?' },
};
