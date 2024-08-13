export interface IEncryptorAdapter {
  encrypt(data: string): string;
  decrypt(encryptedData: string): string;
}
