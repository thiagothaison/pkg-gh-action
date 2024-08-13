import { container } from 'tsyringe';

import { Containers } from '../../../../domain/enums/container/names';
import { Printer } from '../../../../domain/enums/printers';
import { Parameters, Template } from '../../../../domain/protocols/services/printer.service';
import { IPrinterStrategy } from '../../../../domain/protocols/strategies/printer.strategy';
import { IQueueEvent, RunOutput } from '../../../../domain/protocols/use-cases/queue/event.use-case';

type Payload = {
  printer: {
    vendorId: number;
    productId: number;
    model: Printer;
  };

  parameters: Parameters<Template.TAG>;
};

export class PrintTagEvent implements IQueueEvent {
  private readonly printerStrategy: IPrinterStrategy;
  static eventName = 'print-tag';

  constructor() {
    this.printerStrategy = container.resolve<IPrinterStrategy>(Containers.Strategies.Printer);
  }

  async run(
    payload: Payload,
    _trackerId?: string,
    _queueName?: string,
    _hidden?: string[],
    _timeout?: number
  ): Promise<RunOutput> {
    try {
      const printerService = this.printerStrategy.getPrinter(payload.printer.model);

      await printerService.print(Template.TAG, payload.printer.vendorId, payload.printer.productId, payload.parameters);

      return { success: true, response: {} };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
