import { NextFunction, Request, Response } from 'express';
import { Type } from '../types';
import { container } from '../container';
import { ExpressExecutionContext } from '../utils';
import { getInterceptors } from '../decorators/use-interceptors';
import type { NestInterceptor } from '../interfaces/nest-interceptor';

/**
 * Middleware викликається після Guards і перед Handler
 * Викликає всі інтерцептори послідовно у порядку: global → controller → method
 * next у ланцюгу — виклик наступного express middleware
 */
export const InterceptorsMiddleware = (
  Ctl: Type,
  handler: Function,
  globalInterceptors: Array<Type>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = new ExpressExecutionContext(Ctl, handler, req, res);
    const interceptorClasses = getInterceptors(handler, Ctl, globalInterceptors);

    let run: () => Promise<any> = async () => {
      next();
    };

    for (let i = interceptorClasses.length - 1; i >= 0; i--) {
      const InterceptorCtor = interceptorClasses[i] as Type<NestInterceptor>;
      const instance = container.resolve<NestInterceptor>(InterceptorCtor);
      const currentRun = run;
      run = () => instance.intercept(ctx, currentRun);
    }

    await run();
  };
};
