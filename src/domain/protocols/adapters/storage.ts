export type Key =
  | 'app.version'
  | 'queue.name'
  | 'queue.host'
  | 'queue.port'
  | 'queue.user'
  | 'queue.password'
  | 'queue.timeout'
  | 'queue.enableAuth';

export type Value<T> = T extends 'app.version' | 'queue.name' | 'queue.host' | 'queue.user' | 'queue.password'
  ? string
  : T extends 'queue.port' | 'queue.timeout'
  ? number
  : T extends 'queue.enableAuth'
  ? boolean
  : never;

export interface IStorageAdapter {
  get<T extends Key>(key: T): Value<T>;
  set<T extends Key>(key: T, value: Value<T>): void;
}
