import {Type} from "../types";
import {ErrorRequestHandler} from "express";
import {container} from "../container";
import {ExpressExecutionContext} from "../utils";
import {getFilters} from "../decorators/use-filters";
import {HttpException} from "./http-exception";

export const FiltersMiddleware = (Ctl: Type, handler: Function, globalFilters: Array<Type>): ErrorRequestHandler => {
  const filters = getFilters(handler, Ctl, globalFilters);

  return async (err, req, res, next) => {
    try {
      const ctx = new ExpressExecutionContext(Ctl, handler, req, res);

      for (const FilterCtor of filters) {
        const filterInstance = container.resolve<any>(FilterCtor);
        if (typeof filterInstance.catch === 'function') {
          await Promise.resolve(filterInstance.catch(err, ctx));
          if (res.headersSent) return;
        }
      }

      if (err instanceof HttpException) {
        return res.status(err.status).json({ message: err.message });
      }

      const status = (err as Error & { status?: number }).status ?? 500;
      const message = (err as Error).message ?? 'Server error';
      res.status(status).json({ message });
    } catch (error) {
      next(error);
    }
  };
};