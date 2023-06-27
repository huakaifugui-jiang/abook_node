import http from 'http';
import { METHODS } from 'http';

interface Request extends http.IncomingMessage {
  test: string;
}

interface Response extends http.ServerResponse {
  test: string;
}

type HttpServerCallback = (req: Request, res: Response) => http.Server | void;

type Method =
  | 'ACL'
  | 'BIND'
  | 'CHECKOUT'
  | 'CONNECT'
  | 'COPY'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'LINK'
  | 'LOCK'
  | 'M-SEARCH'
  | 'MERGE'
  | 'MKACTIVITY'
  | 'MKCALENDAR'
  | 'MKCOL'
  | 'MOVE'
  | 'NOTIFY'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'PURGE'
  | 'PUT'
  | 'REBIND'
  | 'REPORT'
  | 'SEARCH'
  | 'SOURCE'
  | 'SUBSCRIBE'
  | 'TRACE'
  | 'UNBIND'
  | 'UNLINK'
  | 'UNLOCK'
  | 'UNSUBSCRIBE';

type RouterMatcher = (path: string, callback: HttpServerCallback) => void;
type Router = Record<Lowercase<Method>, RouterMatcher>;

const router: Router = {} as Router;

export interface Application extends Router {
  listen(port?: number, hostname?: string, backlog?: number, callback?: () => void): http.Server;
}

const app: Application = {} as Application;

METHODS.forEach(method => {
  app[method.toLowerCase()] = () => {
    console.log(`Handling ${method} request`);
  };
});

app.listen = function (...args) {
  const server = http.createServer((req, res) => {
    res.end('app2');
  });
  return server.listen(...args);
};

export default app;

