import {Type} from "../types";
import {ErrorRequestHandler} from "express";
import {container} from "../container";
import {ExpressExecutionContext} from "../utils";
import {getFilters} from "../decorators/use-filters";

export const FiltersMiddleware = (Ctl: Type, handler: Function, globalFilters: Array<Type>): ErrorRequestHandler => {
  const filters = getFilters(handler, Ctl, globalFilters);

  return async (err, req, res, _next) => {
    const ctx = new ExpressExecutionContext(Ctl, handler, req, res);

    for (const FilterCtor of filters) {
      const filterInstance = container.resolve<any>(FilterCtor);
      if (typeof filterInstance.catch === 'function') {
        await Promise.resolve(filterInstance.catch(err, ctx));
        if (res.headersSent) return;
      }
    }

    const status = (err as Error & { status?: number }).status ?? 500;
    const message = (err as Error).message ?? 'Server error';
    res.status(status).json({ error: message });
  };
};