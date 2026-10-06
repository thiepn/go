import { describe, expect, it } from 'vitest';

import {
  readJsonFromStorage,
  type StorageLike,
} from './storage';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  public get length(): number {
    return this.values.size;
  }

  public key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('resilient storage', () => {
  it('returns valid JSON unchanged', () => {
    const storage = new MemoryStorage();
    storage.setItem('test', JSON.stringify({ value: 3 }));

    const value = readJsonFromStorage(
      storage,
      'test',
      () => ({ value: 0 }),
      (candidate): candidate is { value: number } =>
        typeof candidate === 'object' &&
        candidate !== null &&
        'value' in candidate &&
        typeof candidate.value === 'number',
    );

    expect(value).toEqual({ value: 3 });
  });

  it('quarantines malformed JSON and recovers with fallback', () => {
    const storage = new MemoryStorage();
    storage.setItem('thiepn-go:test', '{bad');

    const value = readJsonFromStorage(
      storage,
      'thiepn-go:test',
      () => [],
      Array.isArray,
    );

    expect(value).toEqual([]);
    expect(storage.getItem('thiepn-go:test')).toBeNull();

    const recoveryKeys = Array.from(
      { length: storage.length },
      (_, index) => storage.key(index),
    ).filter((key) => key?.startsWith('thiepn-go:recovery:'));

    expect(recoveryKeys).toHaveLength(1);
  });

  it('quarantines structurally invalid parsed data', () => {
    const storage = new MemoryStorage();
    storage.setItem('thiepn-go:test', JSON.stringify({ nope: true }));

    const value = readJsonFromStorage(
      storage,
      'thiepn-go:test',
      () => [],
      Array.isArray,
    );

    expect(value).toEqual([]);
    expect(storage.getItem('thiepn-go:test')).toBeNull();
  });
});
