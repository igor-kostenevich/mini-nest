import { NextFunction, Request, Response } from 'express';
import { Type } from '../types';
import { container } from '../container';
import { ExpressExecutionContext } from '../utils';
import { getInterceptors } from '../decorators/use-interceptors';
import type { NestInterceptor } from '../interfaces/nest-interceptor';

export const InterceptorsMiddleware = (
  Ctl: Type,
  handler: Function,
  globalInterceptors: Array<Type>,
  handlerInstance: Type,
  handlerFn: Function,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = new ExpressExecutionContext(Ctl, handler, req, res);
    const interceptorClasses = getInterceptors(handler, Ctl, globalInterceptors);

    const executeHandler = async () => {
      const args = (req as Request & { mini_args?: unknown[] }).mini_args ?? [];
      const result = await handlerFn.apply(handlerInstance, args);
      res.json(result);
    };

    let run: () => Promise<any> = executeHandler;

    for (let i = interceptorClasses.length - 1; i >= 0; i--) {
      const InterceptorCtor = interceptorClasses[i] as Type<NestInterceptor>;
      const instance = container.resolve<NestInterceptor>(InterceptorCtor);
      const currentRun = run;
      run = () => instance.intercept(ctx, currentRun);
    }

    try {
      await run();
    } catch (err) {
      next(err);
    }
  };
};
