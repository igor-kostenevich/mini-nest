import express from 'express';
import {container} from './container';
import {Type} from './types';
import {get} from './utils';
import { PipesMiddleware } from './http/pipes.middleware';
import {GuardsMiddleware} from './http/guards.middleware';
import {InterceptorsMiddleware} from './http/interceptors.middleware';
import {FiltersMiddleware} from './http/filters.middleware';
import {asyncHandler} from './http/async.handler';

export class NestFactory {
  static async create(rootModule: any) {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const globalGuards: Array<Type> = [];
    const globalPipes: Array<Type> = [];
    const globalFilters: Array<Type> = [];
    const globalInterceptors: Array<Type> = [];

    const initializedModules = new Set<any>();

    const initializeModule = (mod: any) => {
      if (initializedModules.has(mod)) {
        return;
      }

      const meta = get('mini:module', mod);
      if (!meta) return;

      initializedModules.add(mod);

      for (const importedMod of meta.imports ?? []) {
        initializeModule(importedMod);
      }

      for (const Provider of meta.providers ?? []) {
        if (!container.has(Provider)) {
          container.register(Provider, Provider);
        }
      }
    };

    const registerControllers = (mod: any) => {
      const meta = get('mini:module', mod);
      if (!meta) return;

      for (const importedMod of meta.imports ?? []) {
        registerControllers(importedMod);
      }

      for (const Ctl of meta.controllers ?? []) {
        container.register(Ctl, Ctl);
        const prefix = get('mini:prefix', Ctl) ?? '';
        const routes = get('mini:routes', Ctl) ?? [];

        const instance = container.resolve(Ctl) as InstanceType<typeof Ctl>;

        routes.forEach((r: any) => {
          const handler = instance[r.handlerName] as (...args: any[]) => Promise<any>;

          const path = prefix + r.path;

          (router as any)[r.method](
            path,
            asyncHandler(PipesMiddleware(Ctl, handler, globalPipes)),
            asyncHandler(GuardsMiddleware(Ctl, handler, globalGuards)),
            asyncHandler(InterceptorsMiddleware(Ctl, handler, globalInterceptors, instance, handler)),
            FiltersMiddleware(Ctl, handler, globalFilters),
          );
        });
      }
    };

    initializeModule(rootModule);

    registerControllers(rootModule);

    app.use(router);

    return {
      get: container.resolve,
      listen: (port: number, callback?: () => void) => {
        app.listen(port, callback);
      },
      use: (path: string, handler: express.RequestHandler) => {
        app.use(path, handler);
      },
      useGlobalGuards: (guards: any[]) => {
        globalGuards.push(...guards);
      },
      useGlobalPipes: (pipes: any[]) => {
        globalPipes.push(...pipes);
      },
      useGlobalFilters: (filters: any[]) => {
        globalFilters.push(...filters);
      },
      useGlobalInterceptors: (interceptors: Type[]) => {
        globalInterceptors.push(...interceptors);
      },
    };
  }
}
