export abstract class DbPort<T> {
  abstract getAll(): T[] | Promise<T[]>;
}
