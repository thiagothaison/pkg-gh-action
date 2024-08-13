export type RunAsSuccess = {
  success: boolean;
  response?: Record<string, unknown>;
};

export type RunAsError = {
  success: boolean;
  message?: string;
  response?: Record<string, unknown>;
};

export type RunOutput = RunAsSuccess | RunAsError;

export abstract class IQueueEvent {
  static eventName: string;

  abstract run(
    payload: Record<string, unknown>,
    trackerId?: string,
    queueName?: string,
    hidden?: string[],
    timeout?: number
  ): Promise<RunOutput>;
}
