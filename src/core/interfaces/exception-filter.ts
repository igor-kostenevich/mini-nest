import type {ExecutionContext} from "../utils";

export interface ExceptionFilter {
  catch(exception: any, host: ExecutionContext): any;
}
