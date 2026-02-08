import {container} from "../container";

export function Injectable() {
  return function (target: any) {
    container.register(target, target)
  };
}
