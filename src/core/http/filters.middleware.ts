import {Type} from "../types";
import {ErrorRequestHandler} from "express";

export const FiltersMiddleware = (Ctl: Type, handler: Function, filters: Array<Type>): ErrorRequestHandler => {
  //Here we assume that the filters are classes with a method `catch`
  return (err, req, res, _next) => {
    err.stack = undefined;
    res.status((err as Error & { status: number }).status || 500).json({error: err.message || 'Server error'});
  }
}