import {Type} from "../types";

export function isClass<T>(obj: any): obj is Type<T> {
  return "prototype" in obj;
}
