import { Parameters, Template } from '../../../../../domain/protocols/services/printer.service';
import { BaseTancaTemplate, ZPL } from './base';

export class CustomZplTancaTemplate extends BaseTancaTemplate<Template.CUSTOM_ZPL> {
  async doPrint(parameters: Parameters<Template.CUSTOM_ZPL>): Promise<ZPL> {
    return parameters.zpl;
  }
}
