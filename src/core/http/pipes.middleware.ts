import { NextFunction, Request, Response } from 'express';
import { Type } from '../types';
import { getHandlerArgs } from './handler.middleware';

/**
 * Middleware викликається першим у ланцюгу.
 * Готує req.mini_args (масив аргументів після всіх пайпів) для HandlerMiddleware.
 */
export const PipesMiddleware = (
  Ctl: Type,
  handler: Function,
  globalPipes: Array<Type>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const args = await getHandlerArgs(Ctl, handler, req, globalPipes);
    (req as Request & { mini_args?: unknown[] }).mini_args = args;
    next();
  };
};
