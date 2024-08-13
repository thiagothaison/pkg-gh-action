import 'reflect-metadata';
import 'dotenv/config';
import '../container/tsyringe';

import { container } from 'tsyringe';

import { App } from './app';

const app = container.resolve(App);

app
  .start()
  .then(() => {
    console.log('🚀 Application started');
  })
  .catch((error) => {
    console.error(error);
    app.restart();
  });
