export type CustomDecorator<TKey = string> = MethodDecorator & ClassDecorator & {
  KEY: TKey;
};

export const SetMetadata: <K = string, V = any>(metadataKey: K, metadataValue: V) => CustomDecorator<K>  = (metadataKey, metadataValue) => {
  const df = (target: object, key?: any, descriptor?: any) => {
    if (descriptor) {
      Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metadataKey, metadataValue, target);
    return target;
  };

  df.KEY = metadataKey;
  return df;
}
