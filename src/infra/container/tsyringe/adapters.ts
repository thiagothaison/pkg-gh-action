import { container } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { IEncryptorAdapter } from '../../../domain/protocols/adapters/encryptor';
import { ILoggerAdapter } from '../../../domain/protocols/adapters/logger';
import { IQueueAdapter } from '../../../domain/protocols/adapters/queue';
import { IStorageAdapter } from '../../../domain/protocols/adapters/storage';
import { CryptoJSEncryptorAdapter } from '../../../infra/adapters/encryptor/crypto-js-encryptor.adapter';
import { SimpleNodeLoggerAdapter } from '../../../infra/adapters/logger/simple-node-logger.adapter';
import { NatsAdapter } from '../../../infra/adapters/queue/nats.adapter';
import { SecuraLocalStorageAdapter } from '../../../infra/adapters/storage/secure-local-storage.adapter';

container.registerSingleton<ILoggerAdapter>(Containers.Adapters.Logger, SimpleNodeLoggerAdapter);
container.registerSingleton<IQueueAdapter>(Containers.Adapters.Queue, NatsAdapter);
container.registerSingleton<IStorageAdapter>(Containers.Adapters.Storage, SecuraLocalStorageAdapter);
container.registerSingleton<IEncryptorAdapter>(Containers.Adapters.Encryptor, CryptoJSEncryptorAdapter);
