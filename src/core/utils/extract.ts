import { Request } from 'express';
export type Paramtype = 'body' | 'query' | 'param' | 'header' | 'cookie' | 'file' | 'files';

export const extractParams = (Req: Request, type: Paramtype) => {
  switch (type) {
    case 'body':
      return Req.body;
    case 'query':
      return Req.query;
    case 'param':
      return Req.params;
    case 'header':
      return Req.headers;
    case 'cookie':
      return Req.cookies;
    case 'file':
      return (Req as any).file;
    case 'files':
      return (Req as any).files;
    default:
      throw new Error(`Unknown param type: ${type}`);
  }
}

