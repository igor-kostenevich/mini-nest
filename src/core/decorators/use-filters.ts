import {Type} from "../types";

export const FILTERS_METADATA = Symbol('filters');

/**
 * @UseFilters(HttpExceptionFilter, AllExceptionsFilter)
 * Записує список filter-класів у метадані методу/класу.
 */
export function UseFilters(
  ...filters: Function[]
): ClassDecorator & MethodDecorator {
  return (target: any, key?: string | symbol) => {
    const where = key ? target[key] : target;
    Reflect.defineMetadata(FILTERS_METADATA, filters, where);
  };
}

/** Збирає глобальні + класові + метод-фільтри у правильному порядку */
export function getFilters(
  handler: Function,
  controllerClass: Function,
  globalFilters: Array<Type> = [],
): Array<Type> {
  const controllerFilters = Reflect.getMetadata(FILTERS_METADATA, controllerClass) ?? [];
  const routeFilters = Reflect.getMetadata(FILTERS_METADATA, handler) ?? [];

  return [...globalFilters, ...controllerFilters, ...routeFilters];
}
