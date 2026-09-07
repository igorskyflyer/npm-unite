// Author: Igor Dimitrijević (@igorskyflyer)

import { describe, expect, expectTypeOf, it } from 'vitest';
import { type ExtractUnion, union } from '../src/index.ts';

describe('🧪 Unite tests 🧪', () => {
  const resource = union(['script', 'style']);
  type ResourceType = ExtractUnion<typeof resource>;

  it('#1 should accept a value that is part of the union', () => {
    expect(resource.isValid('script')).toBe(true);
  }); // #1

  it('#2 should reject a value that is not part of the union', () => {
    expect(resource.isValid('link')).toBe(false);
  }); // #2

  it('#3 should reject non-string values', () => {
    expect(resource.isValid(1)).toBe(false);
    expect(resource.isValid(null)).toBe(false);
    expect(resource.isValid(undefined)).toBe(false);
    expect(resource.isValid({})).toBe(false);
    expect(resource.isValid(['script'])).toBe(false);
  }); // #3

  it('#4 should accept an array whose values are all part of the union', () => {
    expect(resource.isValidArray(['script', 'style', 'script'])).toBe(true);
  }); // #4

  it('#5 should reject an array containing at least one invalid value', () => {
    expect(resource.isValidArray(['script', 'link'])).toBe(false);
  }); // #5

  it('#6 should accept an empty array', () => {
    expect(resource.isValidArray([])).toBe(true);
  }); // #6

  it('#7 should reject non-array input to isValidArray', () => {
    expect(resource.isValidArray('script')).toBe(false);
    expect(resource.isValidArray(null)).toBe(false);
    expect(resource.isValidArray(undefined)).toBe(false);
    expect(resource.isValidArray({ 0: 'script', length: 1 })).toBe(false);
  }); // #7

  it('#8 should expose the original values in order via .values', () => {
    expect(resource.values).toEqual(['script', 'style']);
  }); // #8

  it('#9 should return a frozen array from .values', () => {
    expect(Object.isFrozen(resource.values)).toBe(true);
    expect(() =>
      (resource.values as unknown as string[]).push('link'),
    ).toThrow();
  }); // #9

  it('#10 should not be affected by mutation of the original input array', () => {
    const source: string[] = ['admin', 'editor'];
    const validator = union(source as never);

    source.push('viewer');

    expect(validator.values).toEqual(['admin', 'editor']);
    expect(validator.isValid('viewer')).toBe(false);
  }); // #10

  it('#11 should not expose _type as an enumerable runtime property', () => {
    expect(Object.keys(resource)).not.toContain('_type');
    expect(JSON.stringify(resource)).not.toContain('_type');
    expect({ ...resource }).not.toHaveProperty('_type');
  }); // #11

  it('#12 should return undefined when accessing _type directly at runtime', () => {
    expect((resource as unknown as { _type: unknown })._type).toBeUndefined();
  }); // #12

  it('#13 should narrow the value type when isValid returns true', () => {
    const input: unknown = 'style';

    if (resource.isValid(input)) {
      expectTypeOf(input).toEqualTypeOf<ResourceType>();
    }
  }); // #13

  it('#14 should narrow the array type when isValidArray returns true', () => {
    const input: unknown = ['script', 'style'];

    if (resource.isValidArray(input)) {
      expectTypeOf(input).toEqualTypeOf<ResourceType[]>();
    }
  }); // #14

  it('#15 should derive the correct literal union via ExtractUnion', () => {
    expectTypeOf<ResourceType>().toEqualTypeOf<'script' | 'style'>();
  }); // #15

  it('#16 should work with a single-value array', () => {
    const single = union(['only']);

    expect(single.isValid('only')).toBe(true);
    expect(single.isValid('other')).toBe(false);
  }); // #16

  it('#17 should treat duplicate entries in the input as valid without altering validity', () => {
    const withDupes = union(['a', 'a', 'b']);

    expect(withDupes.isValid('a')).toBe(true);
    expect(withDupes.isValidArray(['a', 'a'])).toBe(true);
  }); // #17

  // Requires `vitest --typecheck` (or a `.test-d.ts` file) to actually be enforced;
  // ignored during a normal runtime test pass.
  it('#18 should reject a variable typed as string[] at compile time', () => {
    const widened: string[] = ['x', 'y'];

    // @ts-expect-error - widened is string[], not a literal tuple
    union(widened);

    expect(true).toBe(true);
  }); // #18
});
