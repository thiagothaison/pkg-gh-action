import { EventEmitter } from 'events';

import { IQueueEvent } from '../../../domain/protocols/use-cases/queue/event.use-case';

export type EventInstances = Record<string, IQueueEvent>;

export type Callback = (
  payload: Record<string, unknown>,
  trackerId?: string,
  hidden?: string[],
  timeout?: number
) => Promise<Record<string, unknown>>;

export interface IQueueAdapter {
  start(): Promise<EventEmitter>;
}
