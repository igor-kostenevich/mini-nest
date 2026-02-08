export function Module(metadata: { controllers?: any[]; providers?: any[] }) {
  return function (target: any) {
    Reflect.defineMetadata('mini:module', metadata, target);
  };
}
