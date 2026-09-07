<div align="center">
  <img src="https://raw.githubusercontent.com/igorskyflyer/npm-unite/refs/heads/main/media/unite.png" alt="Icon of Unite" width="256" height="256">
  <h1>Unite</h1>
  <a href="https://www.npmjs.com/package/@igorskyflyer/unite"><img src="https://img.shields.io/npm/v/@igorskyflyer/unite.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@igorskyflyer/unite"><img src="https://img.shields.io/npm/dt/@igorskyflyer/unite.svg" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/@igorskyflyer/unite"><img src="https://img.shields.io/node/v/@igorskyflyer/unite.svg" alt="Node version"></a>
  <a href="https://github.com/igorskyflyer/npm-unite/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@igorskyflyer/unite.svg" alt="License"></a>
  <a href="https://liberapay.com/igorskyflyer/donate"><img src="https://img.shields.io/liberapay/receives/igorskyflyer.svg?logo=liberapay"></a>
</div>

<br>

<blockquote align="center">Type Safety • Zero Deps • Runtime Guard • Auto-complete</blockquote>

<h4 align="center">
  Zero-dependency TypeScript library for deriving a union type, a type guard, and an array validator from a single source array.
</h4>

<br>

## Table of Contents

- ✨ [**Features**](#features)
- 🕵🏼 [**Usage**](#usage)
- 🤹🏼 [**API**](#api)
  - [**union()**](#unionallowedvalues)
  - [**UnionValidator\<T\>**](#unionvalidatort)
  - [**.values**](#values)
  - [**.isValid()**](#isvalidvalue)
  - [**.isValidArray()**](#isvalidarrayvalue)
  - [**ExtractUnion\<T\>**](#extractuniont)
- 🗒️ [**Examples**](#examples)
- ⚙️ [**Implementation**](#implementation)
- 🎯 [**Motivation**](#motivation)
- 📝 [**Changelog**](#changelog)
- 🪪 [**License**](#license)
- 💖 [**Support**](#support)
- 🧬 [**Related**](#related)
- 👨🏻‍💻 [**Author**](#author)

<br>

## Features

- ✅ Generates a literal union type from one array, no `as const` required
- 🛡️ Runtime validator included, checks values against the exact same source array
- 📦 One declaration powers the type, the guard and the raw values list
- 🔒 Compile-time error blocks widened `string[]` inputs before they cause bugs
- 🧊 Source array frozen internally, prevents accidental mutation after creation
- 🔍 Array validator built in, checks whole lists against the allowed set
- 🪶 Zero dependencies, tiny footprint
- 🎯 Full TypeScript autocomplete on valid values
- ⚡ Negligible runtime cost, validation stays as fast as a plain `includes()` check
- 🧩 Fits any project needing a single source of truth for allowed string values

<br>

## Usage

Install it by executing any of the following, depending on the preferred package manager:

```bash
bun add @igorskyflyer/unite
```

```bash
pnpm add @igorskyflyer/unite
```

```bash
yarn add @igorskyflyer/unite
```

```bash
npm i @igorskyflyer/unite
```

<br>

## API

### `union(allowedValues)`

```typescript
function union<const T extends readonly string[]>(allowedValues: T): UnionValidator<T>
```

Derives a literal union type and a matching runtime validator from a single array of allowed string values.

The array should be passed as a literal, or as a value typed with `as const`, so that TypeScript can infer its literal element types rather than widening them to `string`. Passing a variable explicitly typed as `string[]` is rejected at compile time.

<br>

### `UnionValidator<T>`

```typescript
interface UnionValidator<T extends readonly string[]>
```

The interface returned by [`union()`](#unionallowedvalues). Exported to allow explicit type annotations on exported variables when strict declaration emit is required.

<br>

### `.values`

```typescript
readonly values: T
```

The original array of allowed values, frozen and returned as-is.

Mutating the array originally passed to `union()` has no effect on this property or on the validator's behavior.

<br>

### `.isValid(value)`

```typescript
isValid(value: unknown): value is T[number]
```

Checks whether a single value belongs to the allowed set.

Acts as a TypeScript type guard: when it returns `true`, `value` is narrowed to the literal union type derived from the allowed values.

<br>

### `.isValidArray(value)`

```typescript
isValidArray(value: unknown): value is T[number][]
```

Checks whether every element of an array belongs to the allowed set.

Acts as a TypeScript type guard: when it returns `true`, `value` is narrowed to an array of the literal union type derived from the allowed values. Returns `false` if `value` is not an array. Returns `true` for an empty array.

<br>

### `ExtractUnion<T>`

```typescript
type ExtractUnion<T extends { _type: unknown }> = T['_type']
```

Extracts the literal union type from a `UnionValidator` instance returned by `union()`.

<br>

## Examples

```typescript
import { union, type ExtractUnion } from '@igorskyflyer/unite'

const resourceType = union(['script', 'style'])
type ResourceType = ExtractUnion<typeof resourceType>
// "script" | "style"

resourceType.isValid('script')
// true

resourceType.isValid('link')
// false

resourceType.isValidArray(['script', 'style'])
// true

resourceType.values
// readonly ["script", "style"]
```

```typescript
// Narrowing unknown input, e.g. parsed JSON or a config value.

function handle(input: unknown) {
  if (resourceType.isValid(input)) {
    // input: "script" | "style" here, not string
  }
}
```

<br>

## Implementation

`union()` uses a `const` type parameter to infer the literal union directly from the array passed in, without requiring `as const`. A conditional type rejects, at compile time, any input whose element type has already widened to `string`, for example, a variable declared as `string[]` before being passed in.

The original array is copied and frozen internally before being returned via `.values`, so mutating the caller's original array after the validator is created has no effect on the validator's behavior.

`.isValid()` and `.isValidArray()` perform the actual runtime check, using `Array.prototype.includes` and `Array.prototype.every` respectively against the frozen array. No property named `_type` exists on the returned object at runtime; it is declared only in the TypeScript interface, for `ExtractUnion` to read at the type level.

<br>

## Motivation

Deriving a literal union type and a matching runtime validator from the same array is a common requirement, usually solved by hand with `as const` plus a separately written type guard. This pattern is prone to drift: the array, the type, and the guard can fall out of sync without a compile error, particularly when the array is declared with an explicit `string[]` annotation instead of a literal.

`unite` collapses this into a single declaration, so the type, the guard, and the original values all derive from one source array.

<br>

## Changelog

Read about the latest changes in the [**CHANGELOG**](https://github.com/igorskyflyer/npm-unite/blob/main/CHANGELOG.md).

<br>

## License

Licensed under the [**MIT license**](https://github.com/igorskyflyer/npm-unite/blob/main/LICENSE).

<br>

## Support

<div align="center">
  If this open-source project has saved you time or improved your workflow, consider supporting its continued development via <a href="https://liberapay.com/igorskyflyer/donate"><strong>LiberaPay</strong></a> or <a href="https://ko-fi.com/igorskyflyer"><strong>Ko-Fi</strong></a>.
  <br>
  <br>
  <a href="https://liberapay.com/igorskyflyer/donate"><img alt=" Igor Dimitrijević (igorskyflyer) - Donate via Liberapay to Sustain Open-Source Projects" src="https://liberapay.com/assets/widgets/donate.svg" loading="lazy"></a> <a href="https://ko-fi.com/igorskyflyer"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Support Igor Dimitrijević (igorskyflyer) - Donate via Ko-Fi to Sustain Open-Source Projects" width="120" height="30" loading="lazy"></a>
  <br>
  <br>
  <blockquote>
    Support helps fund new open-source tools, maintenance, and documentation, thank you!
  </blockquote>
</div>

<br>

## Related

[**@igorskyflyer/rawelement**](https://www.npmjs.com/package/@igorskyflyer/rawelement)

> _A utility that lets you manipulate HTML elements, their attributes and innerHTML as strings, on the go and then render the modified HTML. Very useful in SSG projects._

<br>

[**@igorskyflyer/common-types**](https://www.npmjs.com/package/@igorskyflyer/common-types)

> _🔦 Provides frequently used types for your TypeScript projects. 🦄_

<br>

[**@igorskyflyer/common-color**](https://www.npmjs.com/package/@igorskyflyer/common-color)

> _🎨 Provides common Color-related TypeScript types. 🌈_

<br>

[**@igorskyflyer/valid-path**](https://www.npmjs.com/package/@igorskyflyer/valid-path)

> _🧰 Determines whether a given value can be a valid file/directory name. 🏜_

<br>

[**@igorskyflyer/vscode-folderpicker**](https://www.npmjs.com/package/@igorskyflyer/vscode-folderpicker)

> _✨ Fast, custom cross-platform folder picker and creator for VS Code with icons, validation, and instant navigation. 🎨_

<br>

## Author

Created by <a href="https://igorskyflyer.me/"><strong>Igor Dimitrijević (<em>igorskyflyer</em>)</strong></a>, a senior full-stack software engineer and freelance architect.
