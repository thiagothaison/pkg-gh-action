import { container } from 'tsyringe';

import { Containers } from '../../../enums/container/names';
import { Printer } from '../../../enums/printers';
import { IPrinterStrategy } from '../../../protocols/strategies/printer.strategy';
import { IQueueEvent, RunOutput } from '../../../protocols/use-cases/queue/event.use-case';

type Payload = {
  printer: {
    vendorId: number;
    productId: number;
    model: Printer;
  };

  zpl: string;
};

export class PrintZplEvent implements IQueueEvent {
  static eventName = 'print-zpl';

  private readonly printerStrategy: IPrinterStrategy;

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

      await printerService.printZpl(payload.printer.vendorId, payload.printer.productId, payload.zpl);

      return { success: true, response: {} };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
