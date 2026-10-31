const EMPTY: readonly never[] = [];

/** List endpoints and nested list fields. A missing API often returns HTML or an object, which is truthy and has no array methods. */
export function asArray<T>(value: readonly T[] | null | undefined): T[];
export function asArray<T = unknown>(value: unknown): T[];
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : (EMPTY as unknown as T[]);
}
