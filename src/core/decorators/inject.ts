export function Inject(token?: any) {
  return function (target: any, propertyKey: string | undefined, parameterIndex: number) {
    const constructor = propertyKey === undefined ? (target.constructor || target) : target.constructor;
    const tokens: any[] = Reflect.getMetadata('mini:inject_tokens', constructor) ?? [];
    tokens[parameterIndex] = token;

    Reflect.defineMetadata('mini:inject_tokens', tokens, constructor);
  };
}
