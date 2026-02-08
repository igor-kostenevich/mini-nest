import type { Request, Response } from 'express';

/** Мінімальний спільний API з NestJS */
export interface ExecutionContext {
  /** Поточний клас-контролер */
  getClass(): Function;
  /** Поточний метод-обробник */
  getHandler(): Function;

  /** Адаптер під Express / Fastify тощо */
  switchToHttp(): {
    getRequest: () => Request;
    getResponse: () => Response;
  };
}

/** Реалізація для Express-раутів */
export class ExpressExecutionContext implements ExecutionContext {
  constructor(
    private readonly targetClass: Function,
    private readonly targetHandler: Function,
    private readonly req: Request,
    private readonly res: Response,
  ) {}

  getClass(): Function {
    return this.targetClass;
  }

  getHandler(): Function {
    return this.targetHandler;
  }

  switchToHttp() {
    return {
      getRequest: () => this.req,
      getResponse: () => this.res,
    };
  }
}