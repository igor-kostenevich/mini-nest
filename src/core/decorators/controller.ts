export function Controller(prefix = '') {
  return function (target: any) {
    Reflect.defineMetadata('mini:prefix', prefix, target);
  };
}

export const isController = (target: any) => {
  return Reflect.hasMetadata('mini:prefix', target);
}
