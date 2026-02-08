import type {ExecutionContext} from "../utils";
export interface CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | undefined;
}
