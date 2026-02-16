import 'reflect-metadata';
import {isController} from "./decorators";

export class Container {
  #registered = new Map();
  #singletons = new Map();

  resolve<T>(token: any): T {
    if (this.#singletons.has(token)) return this.#singletons.get(token);
    const cs = this.#registered.get(token);
    if(!cs) {
      throw new Error(`Token ${token?.name || token} is not registered.`);
    }

    const designTypes: any[] = Reflect.getMetadata("design:paramtypes", cs) || [];
    const injectTokens: any[] = Reflect.getMetadata("mini:inject_tokens", cs) || [];

    const deps: any[] = designTypes.map((d, idx) => {
      return injectTokens[idx] !== undefined ? injectTokens[idx] : d;
    });

    const resolved = new cs(...deps.map(d => {
      if(d === token) {
        throw new Error(`Circular dependency detected for token ${token?.name || token}.`);
      }

      return this.resolve(d)
    }));

    this.#singletons.set(token, resolved);
    return resolved;
  }

  register(token: any, member: any): void {
    if (this.#registered.has(token)) {
      if (this.#registered.get(token) === member) {
        return;
      }
      throw new Error(`Token ${token?.name || token} is already registered.`);
    }

    this.#registered.set(token, member);
  }

  has(token: any): boolean {
    return this.#registered.has(token);
  }
}

export const container = new Container();
