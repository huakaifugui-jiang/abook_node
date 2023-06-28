import http from 'http';
import { METHODS } from 'http';
import { pathToRegexp } from 'path-to-regexp';

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
interface Route {
  path: string;
  regexp: RegExp;
  method: Method;
}
export interface Application extends Router {
  listen(port?: number, hostname?: string, backlog?: number, callback?: () => void): http.Server;
  this: Object;
  _router: {
    all: {};
    stack: Route[];
  };
}

const app: Application = {} as Application;

METHODS.forEach(method => {
  app[method.toLowerCase()] = function (path: string) {
    if (!this._router) {
      this._router = { all: {}, stack: [] };
    }
    this._router.stack.push({ path, regexp: pathToRegexp(path), method });
  };
});

app.listen = function (...args) {
  const server = http.createServer((req, res) => {
    const path = new URL(req.url);
    console.log(req.url, path);
    app._router.stack.forEach(route => {});

    res.end('123');
  });

  return server.listen(...args);
};

export default app;

