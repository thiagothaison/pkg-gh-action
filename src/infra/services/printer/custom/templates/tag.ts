import { Parameters, Template } from '../../../../../domain/protocols/services/printer.service';
import { BaseCustomTemplate, ZPL } from './base';

export class TagCustomTemplate extends BaseCustomTemplate<Template.TAG> {
  async doPrint(parameters: Parameters<Template.TAG>): Promise<ZPL> {
    const zpl = `
      ^XA
      ^CI27

      ${this.makeHeader(parameters)}

      ${this.makeBody(parameters)}

      ${this.makeFooter(parameters)}

      ^XZ
    `;

    return zpl;
  }

  private makeHeader(parameters: Parameters<Template.TAG>): ZPL {
    return `
      ^FX First Header. Product name
      ^FO${this.getPositionX(0)},${this.getPositionY(20)}^GB440,40,40^FS
      ^FO${this.getPositionX(10)},${this.getPositionY(30)}^FR^A0N,30,30^FD${parameters.productName}^FS

      ^FX Second Header. Due date
      ^FO${this.getPositionX(0)},${this.getPositionY(65)}^GB440,40,40^FS
      ^FO${this.getPositionX(10)},${this.getPositionY(75)}^FR^A0N,30,30^FDVAL.:^FS
      ^FO${this.getPositionX(85)},${this.getPositionY(75)}^FR^FB${this.getPositionX(125)},1,0,R^A0N,30,30^FD${
      parameters.dueDate
    }^FS
    `;
  }

  private makeBody(parameters: Parameters<Template.TAG>): ZPL {
    let lineSpacing = 40;
    let lineStartYPosition = 120;

    let zpl = '';

    if (parameters?.conservationMode) {
      zpl += `
        ^FX Conservation mode and weight
        ^FO${this.getPositionX(0)},${this.getPositionY(lineStartYPosition)}^A0N,25,25^FD${
        parameters.conservationMode
      }^FS
        ^FO${this.getPositionX(160)},${this.getPositionY(lineStartYPosition)}^FB280,1,0,R^A0N,25,25^FD${
        parameters.weight
      }^FS

        ^FX Draw line
        ^FO${this.getPositionX(0)},${this.getPositionY(lineStartYPosition + 25)}^GB440,1,2^FS
      `;
      lineStartYPosition += lineSpacing;
    }

    lineSpacing = 30;

    if (parameters?.groupName) {
      zpl += `
        ^FX Product Group
        ^FO${this.getPositionX(0)},${this.getPositionY(lineStartYPosition)}^A0N,25,25^FDGRUPO:^FS
        ^FO${this.getPositionX(90)},${this.getPositionY(lineStartYPosition)}^FB350,1,0,R^A0N,25,25^FD${
        parameters.groupName
      }^FS
      `;
      lineStartYPosition += lineSpacing;
    }

    if (parameters?.handlingDate) {
      zpl += `
        ^FX Product handling date
        ^FO${this.getPositionX(0)},${this.getPositionY(lineStartYPosition)}^A0N,25,25^FDMANIPULAÇÃO:^FS
        ^FO${this.getPositionX(160)},${this.getPositionY(lineStartYPosition)}^FB280,1,0,R^A0N,25,25^FD${
        parameters.handlingDate
      }^FS
      `;
      lineStartYPosition += lineSpacing;
    }

    if (parameters?.brand) {
      zpl += `
        ^FX Product brand
        ^FO${this.getPositionX(0)},${this.getPositionY(lineStartYPosition)}^A0N,25,25^FDMARCA:^FS
        ^FO${this.getPositionX(90)},${this.getPositionY(lineStartYPosition)}^FB350,1,0,R^A0N,25,25^FD${
        parameters.brand
      }^FS
      `;
      lineStartYPosition += lineSpacing;
    }

    if (parameters?.sif || parameters?.batch) {
      const label = parameters?.sif && parameters?.batch ? 'SIF / LOTE' : parameters?.sif ? 'SIF' : 'LOTE';
      const value =
        parameters?.sif && parameters?.batch
          ? `${parameters.sif} / ${parameters.batch}`
          : parameters?.sif
          ? parameters.sif
          : parameters?.batch;
      zpl += `
        ^FX Product SIF / LOTE
        ^FO${this.getPositionX(0)},${this.getPositionY(lineStartYPosition)}^A0N,25,25^FD${label}:^FS
        ^FO${this.getPositionX(100)},${this.getPositionY(lineStartYPosition)}^FB340,1,0,R^A0N,25,25^FD${value}^FS
      `;
      lineStartYPosition += lineSpacing;
    }

    return zpl;
  }

  private makeFooter(parameters: Parameters<Template.TAG>): ZPL {
    let zpl = `
      ^FX Tag sponsor
      ^FO${this.getPositionX(0)},${this.getPositionY(280)}^GB440,40,40^FS
      ^FO${this.getPositionX(10)},${this.getPositionY(290)}^FR^A0N,30,30^FDRESP.:^FS
      ^FO${this.getPositionX(85)},${this.getPositionY(290)}^FR^FB${this.getPositionX(125)},1,0,R^A0N,30,30^FD${
      parameters.sponsor
    }^FS
    `;

    if (parameters?.qrCodeUrl) {
      zpl += `
        ^FX Tag ID
        ^FO${this.getPositionX(50)},${this.getPositionY(380)}^A0N,30,30^FD#${parameters.tagId}^FS

        ^FX QRCode for Tag details
        ^FO${this.getPositionX(305)},${this.getPositionY(330)}^BQN,2,4^FDQA,${parameters.qrCodeUrl}^FS
      `;
    } else {
      zpl += `
        ^FX Tag ID
        ^FO${this.getPositionX(150)},${this.getPositionY(380)}^A0N,30,30^FD#${parameters.tagId}^FS
      `;
    }

    return zpl;
  }
}
