import fs from 'fs';
import ini from 'ini';
import { resolve } from 'path';
import { inject, injectable } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { ILoggerAdapter } from '../../../domain/protocols/adapters/logger';
import { IStorageAdapter } from '../../../domain/protocols/adapters/storage';
import { IEnvironment } from '../../../domain/protocols/environment';

@injectable()
export class LoadConfigurationUseCase {
  private readonly configFileName = 'etiquetei.ini';
  private readonly logger;

  constructor(
    @inject(Containers.Adapters.Storage)
    private readonly storage: IStorageAdapter,

    @inject(Containers.Adapters.Logger)
    private readonly log: ILoggerAdapter,

    @inject(Containers.Environment)
    private readonly environment: IEnvironment
  ) {
    this.logger = this.log.configure({ prefix: 'startup' }).getInstance();
  }

  run(): void {
    const configurationFilePath = resolve(this.environment.app.path, this.configFileName);

    try {
      fs.statSync(configurationFilePath);
    } catch (err) {
      this.logger.info(`Reconfiguration file ${configurationFilePath} does not exists`);
      this.logger.info('Preparing to startup application');

      return;
    }

    this.logger.info(`Reading configuration file from ${configurationFilePath}`);
    this.logger.info('Preparing to update configuration');

    this.loadConfiguration(configurationFilePath);
  }

  private loadConfiguration(configurationFilePath: string): void {
    const configurations = ini.parse(fs.readFileSync(configurationFilePath, 'utf-8'));

    const parsedConfiguration = this.parseConfiguration(configurations);

    Object.entries(parsedConfiguration).forEach(([key, value]) => {
      this.logger.info(`Loading configuration ${key}`);

      this.storage.set(key as any, value);
    });

    if (this.environment.isProduction()) {
      fs.unlinkSync(configurationFilePath);
    }
  }

  private parseConfiguration(configuration: Record<string, any>, prefix = ''): Record<string, any> {
    const parsedConfiguration: Record<string, any> = {};
    const configurationKeys = Object.keys(configuration);

    configurationKeys.forEach((key) => {
      const currentKey = prefix ? `${prefix}.${key}` : key;

      if (typeof configuration[key] !== 'object') {
        parsedConfiguration[currentKey] = configuration[key];

        return;
      }

      Object.assign(parsedConfiguration, this.parseConfiguration(configuration[key], currentKey));
    });

    return parsedConfiguration;
  }
}
