import CryptoJS from 'crypto-js';
import { inject, injectable } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { IEncryptorAdapter } from '../../../domain/protocols/adapters/encryptor';
import { IEnvironment } from '../../../domain/protocols/environment';

@injectable()
export class CryptoJSEncryptorAdapter implements IEncryptorAdapter {
  private readonly key: string;

  constructor(
    @inject(Containers.Environment)
    private readonly environment: IEnvironment
  ) {
    this.key = this.environment.app.key;
  }

  encrypt(data: string): string {
    const encryptedData = CryptoJS.AES.encrypt(data, this.key);

    return encryptedData.toString();
  }

  decrypt(encryptedData: string): string {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.key);

    return decryptedData.toString(CryptoJS.enc.Utf8);
  }
}
