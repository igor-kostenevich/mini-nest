import 'reflect-metadata';
import { Injectable } from '../decorators';
import { Type } from '../types';                       // util-alias

@Injectable()
export class Reflector {
  public get<TResult = any, TKey = any>(
    metadataKeyOrDecorator: TKey,
    target: Type<any> | Function,
  ): TResult {
    const metadataKey =
      (metadataKeyOrDecorator as {KEY: string}).KEY ??
      metadataKeyOrDecorator;

    return Reflect.getMetadata(metadataKey, target);
  }

  getAllAndOverride<T = any>(
    key: string | symbol,
    targets: Array<Type<any> | Function>,
  ): T | undefined {
    for (const target of targets) {
      const value = this.get(key, target);
      if (value !== undefined) return value as T;
    }
    return undefined;
  }
}