import {NextFunction, Request, Response} from "express";
import {runGuards} from "../decorators";
import {Type} from "../types";

export const GuardsMiddleware = (Ctl: Type, handler: Function, globalGuards: Array<Type> = []) => async (req: Request, res: Response, next: NextFunction) => {
  const guardResult = await runGuards(Ctl, handler, req, res, globalGuards);
  if (typeof guardResult !== 'string') {
    return next();
  }
  res.status(403).json({message: `Forbidden by ${guardResult}`});
}