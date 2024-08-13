import * as USB from 'usb';

import { Parameters, Template } from '../../../../../domain/protocols/services/printer.service';

export type ZPL = string;

export abstract class BaseTancaTemplate<T extends Template> {
  protected readonly marginLeft = 215;
  protected readonly marginTop = 115;

  protected vendorId: number;
  protected productId: number;

  private device: USB.usb.Device;
  private interface: USB.Interface;
  private endpoint: USB.OutEndpoint;

  setVendorId(vendorId: number): this {
    this.vendorId = vendorId;

    return this;
  }

  setProductId(productId: number): this {
    this.productId = productId;

    return this;
  }

  async heartBeat(): Promise<void> {
    this.prePrint();

    const zpl = '^XA^XZ';

    await this.postPrint(zpl);
  }

  async print(parameters: Parameters<T>): Promise<void> {
    this.prePrint();

    const zpl = await this.doPrint(parameters);

    await this.postPrint(zpl);
  }

  protected getDevice(): void {
    if (!this.vendorId) throw new Error('Vendor ID not set');
    if (!this.productId) throw new Error('Product ID not set');

    const device = USB.findByIds(this.vendorId, this.productId);

    if (!device) {
      throw new Error('Printer not found');
    }

    this.device = device;
  }

  protected prePrint(): void {
    this.getDevice();

    this.device.open();
    this.interface = this.device.interface(0);

    if (!this.interface) throw new Error('Printer Interface not found');

    if (this.interface.isKernelDriverActive()) {
      this.interface.detachKernelDriver();
    }

    this.interface.claim();

    this.endpoint = this.interface.endpoints.find((endpoint) => endpoint.direction === 'out') as USB.OutEndpoint;

    if (!this.endpoint) throw new Error('Printer Endpoint not found');
  }

  protected async postPrint(zpl: string): Promise<void> {
    const buffer = Buffer.from(zpl, 'ascii');

    await new Promise<void>((resolve, reject) => {
      this.endpoint.transfer(buffer, (error: Error) => {
        if (error) {
          reject(new Error(`Unable to print: ${error.message}`));
        }

        this.interface.release(true, (releaseError: Error) => {
          if (releaseError) {
            reject(new Error(`Erro ao liberar interface: ${releaseError.message}`));
          }

          this.device.close();

          this.device = undefined;
          this.interface = undefined;
          this.endpoint = undefined;

          resolve();
        });
      });
    });
  }

  protected abstract doPrint(parameters: Parameters<T>): Promise<ZPL>;

  protected getPositionX(x: number): number {
    return x + this.marginLeft;
  }

  protected getPositionY(y: number): number {
    return y + this.marginTop;
  }
}
