export class ResourcePool<T> {
  private readonly available: T[] = [];
  private readonly inUse = new Set<T>();

  constructor(private readonly maxSize: number) {}

  acquire(factory: () => T): T {
    const resource = this.available.pop() ?? factory();

    if (this.inUse.size >= this.maxSize) {
      throw new Error(`Resource pool exhausted. Max size is ${this.maxSize}.`);
    }

    this.inUse.add(resource);
    return resource;
  }

  release(resource: T): void {
    if (this.inUse.delete(resource)) {
      this.available.push(resource);
    }
  }

  snapshot(): { available: number; inUse: number; maxSize: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      maxSize: this.maxSize,
    };
  }
}
