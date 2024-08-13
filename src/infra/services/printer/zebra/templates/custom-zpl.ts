import { Parameters, Template } from '../../../../../domain/protocols/services/printer.service';
import { BaseZebraTemplate, ZPL } from './base';

export class CustomZplZebraTemplate extends BaseZebraTemplate<Template.CUSTOM_ZPL> {
  async doPrint(parameters: Parameters<Template.CUSTOM_ZPL>): Promise<ZPL> {
    return parameters.zpl;
  }
}
