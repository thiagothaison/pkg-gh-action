import { container } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { IPrinterStrategy } from '../../../domain/protocols/strategies/printer.strategy';
import { PrinterStrategy } from '../../../infra/strategies/printer.strategy';

container.registerSingleton<IPrinterStrategy>(Containers.Strategies.Printer, PrinterStrategy);
