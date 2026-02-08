import {Request, Response} from "express";
import {ArgumentMetadata, Type} from "../types";
import {extractParams, get} from "../utils";
import {runPipes} from "../decorators";

class PipeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PipeError";
  }
}

const getHandlerArgs = async (Ctl: Function, handler: Function, req: Request, globalPipes: Array<Type>) => {
  const paramMeta: Array<ArgumentMetadata> = get('mini:params', Ctl) ?? [];
  const methodMeta: Array<ArgumentMetadata> = paramMeta
    .filter(m => m.name === handler.name);
  const sortedMeta = [...methodMeta].sort((a, b) => a.index - b.index);
  const args: any[] = [];
  for (const metadata of sortedMeta) {
    const extracted = extractParams(req, metadata.type);
    const argument = metadata.data ? extracted[metadata.data] : extracted;

    try {
      args[metadata.index] = await runPipes(Ctl, handler, argument, metadata, globalPipes);
    } catch (error: any) {
      throw new PipeError(`Pipe error for: ${error.message}`);
    }
  }

  return args;
}

export const HandlerMiddleware = (instance: Type, handler: Function, globalPipes: Array<Type>) => {
  return async (req: Request, res: Response) => {
    const args = await getHandlerArgs(instance.constructor, handler, req, globalPipes);

    const result = await handler.apply(instance, args);
    res.json(result);
  }
}