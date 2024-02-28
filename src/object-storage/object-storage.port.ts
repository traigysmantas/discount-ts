export abstract class ObjectStoragePort {
  abstract getAll(input?: string): string[] | Promise<string[]>;
}
