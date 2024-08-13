import { Printer } from '../../../domain/enums/printers';
import { IPrinterService } from '../../../domain/protocols/services/printer.service';

export interface IPrinterStrategy {
  getPrinter(printer: Printer): IPrinterService;
}
