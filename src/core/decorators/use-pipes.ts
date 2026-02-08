import {ArgumentMetadata, Type} from "../types";
import {isClass} from "../utils";
import {container} from "../container";

export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata: ArgumentMetadata): R | Promise<R>;
}

export const PIPES_METADATA = Symbol('pipes');

/** Метадані pipe на рівні параметра: { [paramIndex]: pipes[] } */
export const PARAM_PIPES_METADATA = 'mini:param:pipes';

type PipesType = Type<PipeTransform> | InstanceType<Type<PipeTransform>>;

export function UsePipes(
  ...pipes: PipesType[]      // посилання на класи-пайпи
): ClassDecorator & MethodDecorator & ParameterDecorator {
  return (target: any, key?: string | symbol, descriptorOrIndex?: number | PropertyDescriptor) => {
    // Parameter decorator: третій аргумент — number (param index)
    if (typeof descriptorOrIndex === 'number') {
      const paramIndex = descriptorOrIndex;
      const propertyKey = key as string;
      const existing: Record<number, PipesType[]> =
        Reflect.getMetadata(PARAM_PIPES_METADATA, target, propertyKey) ?? {};
      existing[paramIndex] = pipes;
      Reflect.defineMetadata(PARAM_PIPES_METADATA, existing, target, propertyKey);
      return;
    }
    // Class or method decorator
    const where = key ? target[key] : target;
    Reflect.defineMetadata(PIPES_METADATA, pipes, where);
  };
}

/** Збирає глобальні + класові + метод-пайпи у правильному порядку */
export function getPipes(
  handler: Function,
  controller: Function,
  globalPipes: PipesType[] = [],
): PipesType[] {
  const classPipes = Reflect.getMetadata(PIPES_METADATA, controller) ?? [];
  const methodPipes = Reflect.getMetadata(PIPES_METADATA, handler) ?? [];
  return [...globalPipes, ...classPipes, ...methodPipes];
}

/** Отримує pipe для конкретного параметра методу */
export function getParamPipes(
  controller: Function,
  handler: Function,
  paramIndex: number,
): PipesType[] {
  const prototype = controller.prototype;
  const methodName = handler.name;
  const paramPipesMap: Record<number, PipesType[]> | undefined =
    Reflect.getMetadata(PARAM_PIPES_METADATA, prototype, methodName);
  return paramPipesMap?.[paramIndex] ?? [];
}

export async function runPipes(
  controllerCls: Function,
  handler: Function,
  value: unknown,
  meta: ArgumentMetadata,
  globalPipes: PipesType[] = [],
  paramPipes: PipesType[] = [],
) {
  const pipes = [...getPipes(handler, controllerCls, globalPipes), ...paramPipes];

  let transformed = value;

  for (const pipe of pipes) {
    const pipeInstance = isClass(pipe)
      ? container.resolve<PipeTransform>(pipe)
      : (pipe as PipeTransform);

    transformed = await Promise.resolve(
      pipeInstance.transform(transformed, meta)
    );
  }
  return transformed;
}