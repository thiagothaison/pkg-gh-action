import dns from 'dns';
import { EventEmitter } from 'events';
import { container } from 'tsyringe';

import { Containers } from '../../domain/enums/container/names';
import { IEnvironment } from '../../domain/protocols/environment';

export class InternetConnection {
  private static eventEmitter: EventEmitter;

  static check(): EventEmitter {
    const environment = container.resolve<IEnvironment>(Containers.Environment);
    const { lockupUrl, timeout } = environment.dns;

    this.eventEmitter = new EventEmitter();

    const lockup = (): void => {
      dns.lookup(lockupUrl, (error) => {
        if (error && error.code === 'ENOTFOUND') {
          this.eventEmitter.emit('internet-error', {
            lockupUrl,
            error
          });
        }
      });
    };

    lockup();

    setInterval(lockup, timeout);

    return this.eventEmitter;
  }
}
