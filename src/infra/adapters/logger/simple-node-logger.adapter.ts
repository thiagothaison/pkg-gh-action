import fs from 'fs';
import { join } from 'path';
import SimpleNodeLogger from 'simple-node-logger';
import { inject, injectable } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { ILoggerAdapter } from '../../../domain/protocols/adapters/logger';
import { IEnvironment } from '../../../domain/protocols/environment';
import { LoggerInstances } from './instances.adapter';

@injectable()
export class SimpleNodeLoggerAdapter implements ILoggerAdapter {
  private readonly dateFormat = 'YYYY-MM-DD';
  private logger: SimpleNodeLogger.Logger;
  private dir: string;
  private prefix: string;

  constructor(
    @inject(Containers.Environment)
    private readonly environment: IEnvironment
  ) {}

  configure({ path, prefix }: { path: string; prefix: string }): this {
    const dir = this.getLogPath(path);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.dir = dir;
    this.prefix = prefix;

    const name = `${this.dir}-${this.prefix}`;
    const instance = LoggerInstances.get(name);

    if (!instance) {
      this.logger = SimpleNodeLogger.createRollingFileLogger({
        fileNamePattern: prefix ? `${prefix}-<DATE>.log` : '<DATE>.log',
        logDirectory: dir,
        dateFormat: this.dateFormat,
        timestampFormat: 'YYYY-MM-DD HH:mm:ss'
      });
    }

    return this;
  }

  getInstance(): ILoggerAdapter {
    const name = `${this.dir}-${this.prefix}`;
    const instance = LoggerInstances.get(name);

    if (instance) {
      return instance as ILoggerAdapter;
    }

    return LoggerInstances.register(name, Object.assign(Object.create(this), this)) as ILoggerAdapter;
  }

  info(message: string): void {
    this.log('info', message);
  }

  error(message: string): void {
    this.log('error', message);
  }

  warn(message: string): void {
    this.log('warn', message);
  }

  debug(message: string): void {
    this.log('debug', message);
  }

  open(date: Date): string {
    const targetDate = (date || new Date()).toISOString().split('T')[0];

    const filename = this.prefix ? `${this.dir}/${this.prefix}-${targetDate}.log` : `${this.dir}/${targetDate}.log`;

    if (!fs.existsSync(filename)) {
      return;
    }

    // eslint-disable-next-line consistent-return
    return fs.readFileSync(filename, 'utf-8');
  }

  private log(level: 'info' | 'error' | 'warn' | 'debug', message: string): void {
    this.logger.log(level, message);

    if (!this.environment.isProduction()) {
      console.log(message);
    }
  }

  private getLogPath(path?: string): string {
    const dir = join(this.environment.app.path, 'logs', path || '');

    return dir;
  }
}
