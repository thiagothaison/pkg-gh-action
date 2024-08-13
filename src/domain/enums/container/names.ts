export namespace Containers {
  export const Environment = 'Environment';

  export enum Adapters {
    Logger = 'LoggerAdapter',
    Queue = 'QueueAdapter',
    Storage = 'StorageAdapter',
    Encryptor = 'EncryptorAdapter'
  }

  export enum Strategies {
    Printer = 'PrinterStrategy'
  }
}
