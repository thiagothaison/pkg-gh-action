export interface IEnvironment {
  readonly app: {
    readonly path: string;
    readonly stage: string;
    readonly key: string;
  };

  readonly dns: {
    readonly lockupUrl: string;
    readonly timeout: number;
  };

  isProduction(): boolean;
}
