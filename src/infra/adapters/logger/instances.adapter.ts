export class LoggerInstances {
  private static instances: Record<string, unknown> = {};

  static register(name: string, instance: unknown): unknown {
    this.instances[name] = instance;

    return instance;
  }

  static get(name: string): unknown {
    if (!this.instances[name]) return null;

    return this.instances[name];
  }
}
