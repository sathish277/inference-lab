// The math behind Lesson 1: bits and bytes.
//
// A bit is one switch: off (0) or on (1).
// n switches can be set in 2 × 2 × … × 2 = 2^n different ways, so they can store 2^n different numbers.
// In a byte (8 bits) each switch has a place value: 128, 64, 32, 16, 8, 4, 2, 1.
// The number stored = the sum of the place values of the switches that are on.

/** How many different values n bits can hold. */
export function valuesFor(nBits: number): number {
  return 2 ** nBits;
}

/** The largest number n bits can hold (counting starts at 0). */
export function maxValue(nBits: number): number {
  return 2 ** nBits - 1;
}

/** Place values, biggest first: placeValues(8) = [128, 64, 32, 16, 8, 4, 2, 1]. */
export function placeValues(nBits = 8): number[] {
  return Array.from({ length: nBits }, (_, i) => 2 ** (nBits - 1 - i));
}

/** The on/off pattern for a number, biggest place first: toBits(37) = [0,0,1,0,0,1,0,1]. */
export function toBits(value: number, nBits = 8): number[] {
  if (!Number.isInteger(value) || value < 0 || value > maxValue(nBits)) {
    throw new RangeError(`${value} doesn't fit in ${nBits} bits`);
  }
  return placeValues(nBits).map((p) => (Math.floor(value / p) % 2 === 1 ? 1 : 0));
}

/** Add up the place values of the switches that are on. */
export function fromBits(bits: number[]): number {
  const places = placeValues(bits.length);
  return bits.reduce((sum, b, i) => sum + (b ? places[i] : 0), 0);
}

/** Flip one switch (index 0 = the 128 switch) and return the new number. */
export function flipBit(value: number, index: number, nBits = 8): number {
  return value ^ (1 << (nBits - 1 - index));
}

/** "0010 0101": a byte written in two groups of four, which is easier to read. */
export function binaryString(value: number, nBits = 8): string {
  const s = toBits(value, nBits).join('');
  return s.replace(/(.{4})(?=.)/g, '$1 ');
}

/** The switches that are on, as a sum: 37 → "32 + 4 + 1". */
export function sumOfPlaces(value: number, nBits = 8): string {
  const parts = placeValues(nBits).filter((p, i) => toBits(value, nBits)[i] === 1);
  return parts.length ? parts.join(' + ') : '0';
}

/** Memory a model needs: parameters × bytes per weight. Returns gigabytes (1 GB = 1 billion bytes). */
export function modelGB(paramsBillions: number, bytesPerWeight: number): number {
  return paramsBillions * bytesPerWeight;
}

/** Big numbers in words people can read: 4294967296 → "about 4.3 billion". */
export function readable(n: number): string {
  if (n < 1e6) return n.toLocaleString('en-US');
  const units: [number, string][] = [
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
  ];
  for (const [size, word] of units) {
    if (n >= size) {
      const v = n / size;
      const exact = Number.isInteger(v);
      return `${exact ? '' : 'about '}${exact ? v : v.toFixed(1)} ${word}`;
    }
  }
  return String(n);
}
