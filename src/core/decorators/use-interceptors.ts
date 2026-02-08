export const INTERCEPTORS_METADATA = Symbol('interceptors');

/**
 * @UseInterceptors(LoggingInterceptor, TransformInterceptor)
 * Записує список interceptor-класів у метадані методу/класу.
 */
export function UseInterceptors(
  ...interceptors: Function[]
): ClassDecorator & MethodDecorator {
  return (target: any, key?: string | symbol) => {
    const where = key ? target[key] : target;
    Reflect.defineMetadata(INTERCEPTORS_METADATA, interceptors, where);
  };
}

/** Збирає глобальні + класові + метод-інтерцептори у правильному порядку */
export function getInterceptors(
  handler: Function,
  controller: Function,
  globalInterceptors: Function[] = [],
): Function[] {
  const classInterceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, controller) ?? [];
  const methodInterceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, handler) ?? [];
  return [...globalInterceptors, ...classInterceptors, ...methodInterceptors];
}
