import { injectable } from 'tsyringe';

import { IQueueEvent, RunOutput } from '../../../../domain/protocols/use-cases/queue/event.use-case';

@injectable()
class HeartBeatEvent implements IQueueEvent {
  static eventName = 'heart-beat';

  async run(
    _payload: Record<string, unknown>,
    _trackerId: string,
    _queueName: string = null,
    _hidden: string[] = null,
    _timeout: number = null
  ): Promise<RunOutput> {
    return { success: true, response: {} };
  }
}

export { HeartBeatEvent };
