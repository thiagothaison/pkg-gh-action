import { IPrinterService, Parameters, Template } from '../../../../domain/protocols/services/printer.service';
import { BaseZebraTemplate } from './templates/base';
import { CustomZplZebraTemplate } from './templates/custom-zpl';
import { TagZebraTemplate } from './templates/tag';

export class ZebraPrinterService implements IPrinterService {
  private readonly templates: Map<Template, BaseZebraTemplate<any>>;

  constructor() {
    this.templates = new Map();
    this.templates.set(Template.TAG, new TagZebraTemplate());
    this.templates.set(Template.CUSTOM_ZPL, new CustomZplZebraTemplate());
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
  ): BaseZebraTemplate<T> {
    const templateService = this.templates.get(template);

    if (!templateService) throw new Error(`Template ${template} not found`);

    templateService.setVendorId(vendorId);
    templateService.setProductId(productId);

    return templateService;
  }
}
