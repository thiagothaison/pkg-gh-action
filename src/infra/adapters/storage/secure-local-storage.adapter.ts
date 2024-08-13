import fs from 'fs';
import ini from 'ini';
import path from 'path';
import { inject, injectable } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { IEncryptorAdapter } from '../../../domain/protocols/adapters/encryptor';
import { IStorageAdapter, Key, Value } from '../../../domain/protocols/adapters/storage';
import { IEnvironment } from '../../../domain/protocols/environment';

@injectable()
export class SecuraLocalStorageAdapter implements IStorageAdapter {
  private readonly filename = 'meta';
  private readonly extension = this.environment.isProduction() ? '.data' : '.ini';
  private readonly isSecure = this.environment.isProduction();
  private storage: Record<string, any>;

  constructor(
    @inject(Containers.Adapters.Encryptor)
    private readonly encryptor: IEncryptorAdapter,

    @inject(Containers.Environment)
    private readonly environment: IEnvironment
  ) {}

  get<T extends Key>(key: T): Value<T> {
    this.readStorage();

    const nestedKey = this.dotNotationToObjectKey(key);
    const value = this.getValueFromNestedKey(this.storage, nestedKey);

    return value;
  }

  set<T extends Key>(key: T, value: Value<T>): void {
    this.readStorage();
    const nestedKey = this.dotNotationToObjectKey(key);

    this.setValueToNestedKey(this.storage, nestedKey, value);
    this.writeStorage();
  }

  private readStorage(): void {
    const filename = path.resolve(this.environment.app.path, `${this.filename}${this.extension}`);

    if (!fs.existsSync(filename)) {
      this.storage = {};
      return;
    }

    let fileContent = fs.readFileSync(filename, 'utf-8');

    if (this.isSecure) {
      fileContent = this.encryptor.decrypt(fileContent);
    }

    this.storage = ini.parse(fileContent);
  }

  private writeStorage(): void {
    if (!this.storage) throw new Error('Storage is not opened');

    const filename = path.resolve(this.environment.app.path, `${this.filename}${this.extension}`);

    let fileContent = ini.stringify(this.storage);

    if (this.isSecure) {
      fileContent = this.encryptor.encrypt(fileContent);
    }

    fs.writeFileSync(filename, fileContent);
  }

  private dotNotationToObjectKey(key: string): string[] {
    return key.split('.');
  }

  private getValueFromNestedKey(obj: Record<string, any>, keys: string[]): any {
    return keys.reduce((o, k) => (o && o[k] !== 'undefined' ? o[k] : undefined), obj);
  }

  private setValueToNestedKey(obj: Record<string, any>, keys: string[], value: any): void {
    keys.reduce((o, k, i) => {
      if (i === keys.length - 1) {
        o[k] = value;
      } else {
        if (!o[k]) o[k] = {};
      }
      return o[k];
    }, obj);
  }
}
