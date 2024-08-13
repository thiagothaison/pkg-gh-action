import path from 'path';

import { IEnvironment } from '../../domain/protocols/environment';

export class Environment implements IEnvironment {
  readonly app = {
    path: process.env.NODE_ENV === 'production' ? path.dirname(process.execPath) : process.cwd(),
    stage: process.env.NODE_ENV || 'development',
    key: process.env.APP_KEY || 'Yoda'
  };

  readonly dns = {
    lockupUrl: process.env.DNS_LOCKUP_URL || 'google.com.br',
    timeout: Number(process.env.DNS_LOCKUP_TIMEOUT) || 1000 * 60 * 5
  };

  isProduction(): boolean {
    return this.app.stage === 'production';
  }
}
