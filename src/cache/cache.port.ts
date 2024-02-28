export abstract class CachePort<T extends string | object | number> {
  abstract get(key: string): T | null | Promise<T> | Promise<null>;

  abstract set({ key, value }: { key: string; value: T }): void | Promise<void>;

  abstract setMultiple(data: { [key: string]: T }): void | Promise<void>;
}
