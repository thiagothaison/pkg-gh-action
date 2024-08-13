import { Parameters, Template } from '../../../../../domain/protocols/services/printer.service';
import { BaseCustomTemplate, ZPL } from './base';

export class CustomZplCustomTemplate extends BaseCustomTemplate<Template.CUSTOM_ZPL> {
  async doPrint(parameters: Parameters<Template.CUSTOM_ZPL>): Promise<ZPL> {
    return parameters.zpl;
  }
}
