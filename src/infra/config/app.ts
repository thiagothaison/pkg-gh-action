import { container, inject, injectable } from 'tsyringe';

import { Containers } from '../../domain/enums/container/names';
import { ILoggerAdapter } from '../../domain/protocols/adapters/logger';
import { IQueueAdapter } from '../../domain/protocols/adapters/queue';
import { IStorageAdapter } from '../../domain/protocols/adapters/storage';
import { IEnvironment } from '../../domain/protocols/environment';
import { LoadConfigurationUseCase } from '../../domain/use-cases/startup/load-configuration.use-case';
import { InternetConnection } from './internet-connection';

@injectable()
export class App {
  constructor(
    @inject(Containers.Environment)
    private readonly environment: IEnvironment,

    @inject(Containers.Adapters.Storage)
    private readonly storage: IStorageAdapter
  ) {}

  async start(): Promise<void> {
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV is not defined');
    }

    const logger = container
      .resolve<ILoggerAdapter>(Containers.Adapters.Logger)
      .configure({ prefix: 'startup' })
      .getInstance();

    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error?.toString()}`);
      logger.error(error?.stack);

      this.restart();
    });

    process.on('unhandledRejection', (error: Error) => {
      logger.error(`Unhandled Rejection: ${error?.toString()}`);
      logger.error(error?.stack);

      this.restart();
    });

    process.on('SIGTERM', () => {
      process.exit();
    });

    container.resolve(LoadConfigurationUseCase).run();

    InternetConnection.check().on('internet-error', ({ dnsLockupUrl, error }) => {
      logger.info(`No internet connection found to access ${String(dnsLockupUrl)}. Restarting`);
      logger.error(JSON.stringify(error));
      this.restart();
    });

    const queue = container.resolve<IQueueAdapter>(Containers.Adapters.Queue);

    try {
      const queueEvents = await queue.start();

      queueEvents.on('due-inactivity', () => {
        logger.info('Restarting application due to inactivity.');

        this.restart();
      });

      queueEvents.on('error', (error) => {
        logger.info('Restarting application due to queue error event.');
        logger.error(JSON.stringify(error));

        this.restart();
      });

      queueEvents.on('close', () => {
        logger.info('Queue connection closed. Restarting');
        this.restart();
      });

      console.log(`🚀 Environment: ${this.environment.app.stage}.etiquetei@${this.storage.get('app.version')}`);
    } catch (error) {
      logger.info('Restarting application due to queue error.');
      logger.error(JSON.stringify(error));

      if (this.environment.isProduction()) this.restart();
    }
  }

  restart(): void {
    process.exit(1);
  }
}
