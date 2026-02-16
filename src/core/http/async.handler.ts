import {NextFunction, ErrorRequestHandler} from "express";

export const asyncHandler = (fn: Function) => {
  if (fn.length === 4) {
    return fn as ErrorRequestHandler;
  }
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};