import './adapters';
import './strategies';

import { container } from 'tsyringe';

import { Containers } from '../../../domain/enums/container/names';
import { IEnvironment } from '../../../domain/protocols/environment';
import { Environment } from '../../../infra/config/environment';

container.registerSingleton<IEnvironment>(Containers.Environment, Environment);
