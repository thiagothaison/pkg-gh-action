type ConfigureOptions = {
  path?: string;
  prefix?: string;
};

export interface ILoggerAdapter {
  configure(options: ConfigureOptions): ILoggerAdapter;
  getInstance(): ILoggerAdapter;
  info(...message: unknown[]): void;
  error(...message: unknown[]): void;
  warn(...message: unknown[]): void;
  debug(...message: unknown[]): void;
  open(date: Date): string;
}
