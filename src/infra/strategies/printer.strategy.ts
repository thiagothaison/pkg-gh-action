import { Printer } from '../../domain/enums/printers';
import { IPrinterService } from '../../domain/protocols/services/printer.service';
import { IPrinterStrategy } from '../../domain/protocols/strategies/printer.strategy';
import { CustomPrinterService } from '../services/printer/custom/printer.service';
import { TancaPrinterService } from '../services/printer/tanca/printer.service';
import { ZebraPrinterService } from '../services/printer/zebra/printer.service';

export class PrinterStrategy implements IPrinterStrategy {
  private readonly strategies: Map<Printer, IPrinterService>;

  constructor() {
    this.strategies = new Map();
    this.strategies.set(Printer.CUSTOM, new CustomPrinterService());
    this.strategies.set(Printer.TANCA, new TancaPrinterService());
    this.strategies.set(Printer.ZEBRA, new ZebraPrinterService());
  }

  getPrinter(printer: Printer): IPrinterService {
    const printerService = this.strategies.get(printer);

    if (!printerService) throw new Error(`Printer ${printer} not allowed`);

    return printerService;
  }
}
