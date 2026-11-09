import { describe, expect, it } from 'vitest';
import { binaryString, flipBit, fromBits, maxValue, modelGB, placeValues, readable, sumOfPlaces, toBits, valuesFor } from './bits';

describe('how many values', () => {
  it('1 bit holds 2 values', () => expect(valuesFor(1)).toBe(2));
  it('4 bits hold 16 values', () => expect(valuesFor(4)).toBe(16));
  it('a byte holds 256 values', () => expect(valuesFor(8)).toBe(256));
  it('16 bits hold 65,536 values', () => expect(valuesFor(16)).toBe(65536));
  it('the biggest byte is 255', () => expect(maxValue(8)).toBe(255));
});

describe('reading and writing a byte', () => {
  it('place values are 128 down to 1', () => expect(placeValues(8)).toEqual([128, 64, 32, 16, 8, 4, 2, 1]));
  it('37 is 0010 0101', () => expect(toBits(37)).toEqual([0, 0, 1, 0, 0, 1, 0, 1]));
  it('0000 0101 is 5', () => expect(fromBits([0, 0, 0, 0, 0, 1, 0, 1])).toBe(5));
  it('all on is 255', () => expect(fromBits([1, 1, 1, 1, 1, 1, 1, 1])).toBe(255));
  it('round-trips every byte', () => {
    for (let v = 0; v <= 255; v++) expect(fromBits(toBits(v))).toBe(v);
  });
  it('flipping the 128 switch adds 128', () => expect(flipBit(37, 0)).toBe(165));
  it('flipping the 1 switch of 37 gives 36', () => expect(flipBit(37, 7)).toBe(36));
  it('writes 37 as "0010 0101"', () => expect(binaryString(37)).toBe('0010 0101'));
  it('explains 37 as 32 + 4 + 1', () => expect(sumOfPlaces(37)).toBe('32 + 4 + 1'));
  it('refuses 256 in one byte', () => expect(() => toBits(256)).toThrow());
});

describe('memory for a model', () => {
  it('7B at 2 bytes per weight is 14 GB', () => expect(modelGB(7, 2)).toBe(14));
  it('7B at half a byte is 3.5 GB', () => expect(modelGB(7, 0.5)).toBe(3.5));
});

describe('readable numbers', () => {
  it('65536 stays exact', () => expect(readable(65536)).toBe('65,536'));
  it('2^32 is about 4.3 billion', () => expect(readable(2 ** 32)).toBe('about 4.3 billion'));
  it('8 billion is exact', () => expect(readable(8e9)).toBe('8 billion'));
});
