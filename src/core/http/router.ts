import express from 'express';
import {container} from '../container';
import {Type} from "../types";
import {get} from "../utils";
import { PipesMiddleware } from "./pipes.middleware";
import {GuardsMiddleware} from "./guards.middleware";
import {InterceptorsMiddleware} from "./interceptors.middleware";
import {FiltersMiddleware} from "./filters.middleware";
import {asyncHandler} from "./async.handler";
import {HttpException} from "./http-exception";

export function Factory(modules: any[]) {
  const app = express();

  app.use(express.json());

  const router = express.Router();
  const globalGuards: Array<Type> = [];
  const globalPipes: Array<Type>  = [];
  const globalFilters: Array<Type>  = [];
  const globalInterceptors: Array<Type> = [];

  const initializedModules = new Set<any>();

  const initializeModule = (mod: any) => {
    if (initializedModules.has(mod)) {
      return;
    }

    const meta = get('mini:module', mod);
    if (!meta) return;

    initializedModules.add(mod);

    // Рекурсивно ініціалізуємо імпортовані модулі
    for (const importedMod of meta.imports ?? []) {
      initializeModule(importedMod);
    }

    // Реєструємо провайдери поточного модуля
    for (const Provider of meta.providers ?? []) {
      if (!container.has(Provider)) {
        container.register(Provider, Provider);
      }
    }
  };

  const listen = (port: number, callback?: () => void) => {
      for (const mod of modules) {
        initializeModule(mod);
      }

      for (const mod of modules) {
        const meta = get('mini:module', mod);
        if (!meta) continue;

        for (const Ctl of meta.controllers ?? []) {
          container.register(Ctl, Ctl)
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
      }

    app.listen(port, callback);
  }

  app.use(router);

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof HttpException) {
      return res.status(err.status).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  });

  return {
    get: container.resolve,
    listen,
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
  }
}
