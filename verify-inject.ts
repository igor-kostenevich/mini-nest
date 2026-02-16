import "reflect-metadata";
import { container } from "./src/core/container";
import { Injectable } from "./src/core/decorators/injectable";
import { Inject } from "./src/core/decorators/inject";

const MY_TOKEN = "MY_TOKEN";

@Injectable()
class DepFromToken { value = 123; }

@Injectable()
class UsesToken {
  public dep: DepFromToken;
  
  constructor(@Inject(MY_TOKEN) dep: DepFromToken) {
    this.dep = dep;
  }
}

container.register(MY_TOKEN as any, DepFromToken as any);

const inst = container.resolve<UsesToken>(UsesToken);
console.log("override-token=", inst.dep instanceof DepFromToken);
console.log("value=", inst.dep.value);
