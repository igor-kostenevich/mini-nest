import { Request, Response } from "express";
import { ArgumentMetadata, Type } from "../types";
import { extractParams, get } from "../utils";
import { getParamPipes, runPipes } from "../decorators";
import { HttpException } from "./http-exception";

class PipeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PipeError";
  }
}

export const getHandlerArgs = async (Ctl: Function, handler: Function, req: Request, globalPipes: Array<Type>) => {
  const paramMeta: Array<ArgumentMetadata> = get('mini:params', Ctl) ?? [];
  const methodMeta: Array<ArgumentMetadata> = paramMeta
    .filter(m => m.name === handler.name);
  const sortedMeta = [...methodMeta].sort((a, b) => a.index - b.index);
  const args: any[] = [];
  for (const metadata of sortedMeta) {
    const extracted = extractParams(req, metadata.type);
    const argument = metadata.data ? extracted[metadata.data] : extracted;

    try {
      const paramPipes = getParamPipes(Ctl, handler, metadata.index);
      args[metadata.index] = await runPipes(Ctl, handler, argument, metadata, globalPipes, paramPipes);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      const pipeError = new PipeError(`Pipe error for: ${error?.message ?? error}`);
      pipeError.cause = error;
      if (typeof error?.status === 'number') {
        (pipeError as Error & { status?: number }).status = error.status;
      }
      throw pipeError;
    }
  }

  return args;
}

/** Очікує, що req.mini_args вже заповнений PipesMiddleware */
export const HandlerMiddleware = (instance: Type, handler: Function, _globalPipes: Array<Type>) => {
  return async (req: Request, res: Response) => {
    const args = (req as Request & { mini_args?: unknown[] }).mini_args ?? [];

    const result = await handler.apply(instance, args);
    res.json(result);
  };
};