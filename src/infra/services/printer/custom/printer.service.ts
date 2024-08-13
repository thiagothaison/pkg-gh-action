import { IPrinterService, Parameters, Template } from '../../../../domain/protocols/services/printer.service';
import { BaseCustomTemplate } from './templates/base';
import { CustomZplCustomTemplate } from './templates/custom-zpl';
import { TagCustomTemplate } from './templates/tag';

export class CustomPrinterService implements IPrinterService {
  private readonly templates: Map<Template, BaseCustomTemplate<any>>;

  constructor() {
    this.templates = new Map();
    this.templates.set(Template.TAG, new TagCustomTemplate());
    this.templates.set(Template.CUSTOM_ZPL, new CustomZplCustomTemplate());
  }

  async heartBeat<T extends Template>(template: T, vendorId: number, productId: number): Promise<void> {
    const templateService = this.getTemplateService(template, vendorId, productId);

    await templateService.heartBeat();
  }

  async print<T extends Template>(
    template: T,
    vendorId: number,
    productId: number,
    parameters: Parameters<T>
  ): Promise<void> {
    const templateService = this.getTemplateService(template, vendorId, productId);

    await templateService.print(parameters);
  }

  async printZpl(vendorId: number, productId: number, zpl: string): Promise<void> {
    const templateService = this.getTemplateService(Template.CUSTOM_ZPL, vendorId, productId);

    await templateService.print({ zpl });
  }

  private getTemplateService<T extends Template>(
    template: T,
    vendorId: number,
    productId: number
  ): BaseCustomTemplate<T> {
    const templateService = this.templates.get(template);

    if (!templateService) throw new Error(`Template ${template} not found`);

    templateService.setVendorId(vendorId);
    templateService.setProductId(productId);

    return templateService;
  }
}
