import {ArgumentMetadata, Type} from "../types";
import {isClass} from "../utils";
import {container} from "../container";

export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata: ArgumentMetadata): R | Promise<R>;
}

export const PIPES_METADATA = Symbol('pipes');

type PipesType = Type<PipeTransform> | InstanceType<Type<PipeTransform>>;

export function UsePipes(
  ...pipes: PipesType[]      // посилання на класи-пайпи
): ClassDecorator & MethodDecorator {
  return (target: any, key?: string | symbol) => {
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

export async function runPipes(
  controllerCls: Function,
  handler: Function,
  value: unknown,
  meta: ArgumentMetadata,
  globalPipes: PipesType[] = [],
) {
  const pipes = getPipes(handler, controllerCls, globalPipes);

  let transformed = value;

  for (const PipeCtor of pipes) {
    const pipeInstance = isClass(PipeCtor) ? container.resolve<PipeTransform>(PipeCtor) : PipeCtor;

    transformed = await Promise.resolve(
      pipeInstance.transform(transformed, meta)
    );
  }
  return transformed;
}