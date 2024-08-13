export enum Template {
  TAG = 'TAG',
  CUSTOM_ZPL = 'CUSTOM_ZPL'
}

export type Parameters<T> = T extends Template.TAG
  ? TagParameters
  : T extends Template.CUSTOM_ZPL
  ? CustomZplParameters
  : never;

export type TagParameters = {
  productName: string;
  dueDate: string;
  conservationMode?: string;
  weight?: string;
  groupName?: string;
  handlingDate?: string;
  brand?: string;
  sif?: string;
  batch?: string;
  sponsor: string;
  tagId: string;
  qrCodeUrl: string;
};

export type CustomZplParameters = {
  zpl: string;
};

export interface IPrinterService {
  heartBeat<T extends Template>(template: T, vendorId: number, productId: number): Promise<void>;
  print<T extends Template>(template: T, vendorId: number, productId: number, parameters: Parameters<T>): Promise<void>;
  printZpl(vendorId: number, productId: number, zpl: string): Promise<void>;
}
