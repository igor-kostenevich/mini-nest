export function Module(metadata: {
  providers?: any[];
  controllers?: any[];
  imports?: any[];
  exports?: any[];
}) {
  return function (target: any) {
    Reflect.defineMetadata('mini:module', metadata, target);
  };
}
