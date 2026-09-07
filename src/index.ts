// Author: Igor Dimitrijević (@igorskyflyer)

/**
 * A validator derived from a fixed set of allowed string literals.
 *
 * Created by {@link union}. Provides both compile-time type extraction,
 * via {@link ExtractUnion}, and runtime membership checks for single
 * values and arrays.
 */
export interface UnionValidator<T extends readonly string[]> {
  /** @internal */
  readonly _type: T[number];

  /**
   * The original array of allowed values, frozen and returned as-is.
   *
   * Mutating the array originally passed to {@link union} has no effect
   * on this property or on the validator's behavior.
   */
  readonly values: T;

  /**
   * Checks whether a single value belongs to the allowed set.
   *
   * Acts as a TypeScript type guard: when it returns `true`, `value` is
   * narrowed to the literal union type derived from the allowed values.
   *
   * @param value - The value to check. Can be of any type.
   * @returns `true` if `value` is one of the allowed values, `false` otherwise.
   */
  isValid(value: unknown): value is T[number];

  /**
   * Checks whether every element of an array belongs to the allowed set.
   *
   * Acts as a TypeScript type guard: when it returns `true`, `value` is
   * narrowed to an array of the literal union type derived from the
   * allowed values. Returns `false` if `value` is not an array. Returns
   * `true` for an empty array.
   *
   * @param value - The value to check. Can be of any type.
   * @returns `true` if `value` is an array whose elements are all allowed values, `false` otherwise.
   */
  isValidArray(value: unknown): value is T[number][];
}

/**
 * Resolves to an object type carrying a descriptive error message when
 * `T` has widened to plain `string` instead of remaining a literal
 * union - typically because the array passed to {@link union} was
 * assigned to a variable typed as `string[]` before being passed in,
 * rather than passed as a literal or a value typed with `as const`.
 *
 * Intersected into {@link union}'s parameter type so that this failure
 * is reported as a compile-time error at the call site, instead of
 * silently producing a validator typed against `string`.
 */
type AssertNotWidened<T extends readonly string[]> = string extends T[number]
  ? {
      readonly __error: 'union: pass an array literal (or a value typed with `as const`), not a variable typed as `string[]`.';
    }
  : unknown;

/**
 * Derives a literal union type and a matching runtime validator from a
 * single array of allowed string values.
 *
 * The array should be passed as a literal, or as a value typed with
 * `as const`, so that TypeScript can infer its literal element types
 * rather than widening them to `string`. Passing a variable explicitly
 * typed as `string[]` is rejected at compile time.
 *
 * @param allowedValues - A readonly array of the allowed string literals.
 * @returns A {@link UnionValidator} for the derived union type.
 *
 * @example
 * ```typescript
 * const resourceType = union(['script', 'style'])
 *
 * type ResourceType = ExtractUnion<typeof resourceType>
 * // "script" | "style"
 *
 * resourceType.isValid('script') // true
 * resourceType.isValid('link')   // false
 * ```
 */
export function union<const T extends readonly string[]>(
  allowedValues: T & AssertNotWidened<T>,
): UnionValidator<T> {
  const frozen = Object.freeze([
    ...(allowedValues as readonly string[]),
  ]) as unknown as T;

  const isValid = (value: unknown): value is T[number] =>
    (frozen as readonly unknown[]).includes(value);

  const isValidArray = ((value: unknown) =>
    Array.isArray(value) &&
    value.every(isValid)) as UnionValidator<T>['isValidArray'];

  return { values: frozen, isValid, isValidArray } as UnionValidator<T>;
}

/**
 * Extracts the literal union type from a {@link UnionValidator} instance
 * returned by {@link union}.
 *
 * @example
 * ```typescript
 * const resourceType = union(['script', 'style'])
 * type ResourceType = ExtractUnion<typeof resourceType>
 * // "script" | "style"
 * ```
 */
export type ExtractUnion<T extends { _type: unknown }> = T['_type'];
