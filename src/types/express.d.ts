import { RequestContext } from 'api/types/request-context';

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}
