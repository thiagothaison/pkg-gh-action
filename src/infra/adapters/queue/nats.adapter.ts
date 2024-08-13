import EventEmitter from 'events';
import { connect as natsConnect, Codec, ConnectionOptions, NatsConnection, StringCodec, Events } from 'nats';
import { container, inject, injectable } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { ILoggerAdapter } from '../../../domain/protocols/adapters/logger';
import { IQueueAdapter, EventInstances } from '../../../domain/protocols/adapters/queue';
import { IStorageAdapter } from '../../../domain/protocols/adapters/storage';
import { IEnvironment } from '../../../domain/protocols/environment';
import { IQueueEvent } from '../../../domain/protocols/use-cases/queue/event.use-case';
import * as events from '../../../domain/use-cases/queue/events';

@injectable()
export class NatsAdapter implements IQueueAdapter {
  private readonly timeoutToRestartApplicationInMs = 1000 * 60 * 30;
  private lastExecutionTime: Date;

  private eventEmitter: EventEmitter;
  private connection: NatsConnection;
  private eventInstances: EventInstances = {};

  private readonly natsEnableAuth: boolean;
  private readonly natsPort: number;
  private readonly natsHost: string;
  private readonly natsUser: string;
  private readonly natsPassword: string;
  private readonly natsTimeout: number;
  private readonly queue: string;

  private readonly stringCodec: Codec<string>;

  private readonly logger;

  constructor(
    @inject(Containers.Adapters.Storage)
    private readonly storage: IStorageAdapter,

    @inject(Containers.Adapters.Logger)
    private readonly log: ILoggerAdapter,

    @inject(Containers.Environment)
    private readonly environment: IEnvironment
  ) {
    this.natsEnableAuth = this.storage.get('queue.enableAuth');
    this.natsPort = +this.storage.get('queue.port');
    this.natsHost = this.storage.get('queue.host');
    this.natsUser = this.storage.get('queue.user');
    this.natsPassword = this.storage.get('queue.password');
    this.natsTimeout = +this.storage.get('queue.timeout');
    this.queue = this.storage.get('queue.name');

    if (!this.queue) {
      throw new Error('Queue name does not provided');
    }

    this.stringCodec = StringCodec();

    this.logger = this.log
      .configure({
        path: this.queue,
        prefix: 'queue'
      })
      .getInstance();
  }

  async start(): Promise<EventEmitter> {
    this.eventEmitter = new EventEmitter();

    await this.connect();

    if (!this.connection) {
      throw new Error('Queue does not connected');
    }

    this.register();

    if (!Object.keys(this.eventInstances).length) {
      throw new Error('No events registered');
    }

    if (!this.eventInstances['heart-beat']) {
      throw new Error('Heart beat does not registered');
    }

    Object.keys(this.eventInstances).forEach((event) => {
      const queueName = `${event}-${this.queue}`;

      this.logger.info(`   > Awaiting RPC requests on queue ${queueName}`);

      this.connection.subscribe(queueName, {
        callback: async (error, message) => {
          if (error) {
            this.logger.error(`⛔ An error occurred while subscribing to queue ${queueName}`, error);

            this.eventEmitter.emit('error');
            return;
          }

          this.logger.info(`   > receiving on ${queueName}`);

          const payload = JSON.parse(this.stringCodec.decode(message.data));
          const {
            payload: eventPayload,
            timeout: eventTimeout = 0,
            trackerId = null,
            sanitize: sanitizeParameters = []
          } = payload;

          const promise = this.eventInstances[event].run(
            eventPayload,
            trackerId,
            this.queue,
            sanitizeParameters,
            eventTimeout
          ) as Promise<Record<string, unknown>>;

          if (message.reply) {
            const response = await promise;
            response.version = this.storage.get('app.version');

            this.lastExecutionTime = new Date();

            message.respond(this.stringCodec.encode(JSON.stringify(response)));
          }
        }
      });
    });

    setInterval(() => {
      if (this.checkInactivity()) {
        this.eventEmitter.emit('due-inactivity');
      }
    }, this.timeoutToRestartApplicationInMs);

    return this.eventEmitter;
  }

  private async connect(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      let connectionUrl = `${this.natsHost}:${this.natsPort}`;

      const options: ConnectionOptions = {
        servers: `${this.natsHost}:${this.natsPort}`,
        reconnect: true,
        timeout: this.natsTimeout
      };

      if (this.natsEnableAuth && this.natsUser && this.natsPassword) {
        options.user = this.natsUser;
        options.pass = this.natsPassword;

        connectionUrl = `${this.natsUser}:${this.natsPassword}@${connectionUrl}`;
      }

      connectionUrl = `nats://${connectionUrl}`;

      natsConnect(options)
        .then(async (connection) => {
          this.logger.info('🔥 NATS Server Connected');

          if (!this.environment.isProduction()) {
            this.logger.info(`   at ${connectionUrl}`);
          }

          this.connection = connection;

          resolve();

          await (async () => {
            // eslint-disable-next-line no-restricted-syntax
            for await (const s of connection.status()) {
              switch (s.type) {
                case Events.Disconnect:
                  this.eventEmitter.emit('close');
                  break;
                case Events.Error:
                  this.eventEmitter.emit('error');
                  break;
                default:
              }
            }
          })().then();
        })
        .catch((error) => {
          this.logger.error('⛔ An error occurred while trying to connect to the nats server', error);
          this.logger.error(error.stack);

          if (!this.environment.isProduction()) {
            this.logger.error(`   at ${connectionUrl}`);
            this.logger.error(`   with options ${JSON.stringify(options)}`);
          }

          reject(new Error('Queue does not connected'));
        });
    });
  }

  private register(): void {
    Object.values(events).forEach((Clazz) => {
      this.logger.info(`   > Registering event ${Clazz.eventName}. OK`);
      this.eventInstances[Clazz.eventName] = container.resolve<IQueueEvent>(Clazz);
    });
  }

  private checkInactivity(): boolean {
    if (!this.lastExecutionTime) return true;

    const now = new Date();
    const diff = now.getTime() - this.lastExecutionTime.getTime();

    return diff > this.timeoutToRestartApplicationInMs;
  }
}
