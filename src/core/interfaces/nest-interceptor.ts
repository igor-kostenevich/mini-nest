import type { ExecutionContext } from "../utils";

export interface NestInterceptor {
  intercept(context: ExecutionContext, next: () => Promise<any>): Promise<any>;
}
