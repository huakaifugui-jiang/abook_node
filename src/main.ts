import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import userSetting from './user/setting';
import { pathToRegexp } from 'path-to-regexp';

//根据请求方法 将业务逻辑进行分发
// function get(req, res) {
//   console.log('来到了GET逻辑');
//   res.write('get');
// }

// function post(req, res) {
//   console.log('来到了Post逻辑');
//   res.write('post');
// }

// http
//   .createServer((req, res) => {
//     switch (req.method) {
//       case 'GET':
//         get(req, res);
//         break;
//       case 'POST':
//         post(req, res);
//         break;
//     }

//     res.end();
//   })
//   .listen(8124);

//根据路径进行判断业务逻辑。
// http
//   .createServer((req, res) => {
//     const pathname = url.parse(req.url).pathname;
//     //在dist目录下创建一个a.js文件
//     fs.readFile(path.join(__dirname, pathname + '.js'), (err, file) => {
//       if (err) {
//         res.writeHead(404);
//         res.end('404 NOT FOUND');
//         return;
//       }

//       res.writeHead(200);
//       res.end(file);
//     });
//   })
//   .listen(8124);

//根据路径来选择控制器
//例如 /controller/action/a/b/c 这里的controller会对应到一个控制器，action对应到控制器的行为，剩余的值会作为参数进行一些别的判断。

// const handles = {
//   pagelist: {
//     getlist: function (req, res, ...args) {
//       console.log(args, 'getlist');

//       res.end('getList');
//     },
//   },
//   index: {
//     index: function (req, res, ...args) {
//       console.log(args, 'index', req.headers, req.headers['transfer-encoding']);
//       req.on('data', data => {
//         console.log(data, 'data');
//       });
//       res.end('index');
//     },
//   },
// };

// http
//   .createServer((req, res) => {
//     const pathname = url.parse(req.url).pathname;

//     const paths = pathname.split('/');
//     const controller = paths[1] || 'index'; //控制器
//     const action = paths[2] || 'index'; //行为
//     const args = paths.slice(3); //剩余的参数
//     if (handles[controller] && handles[controller][action]) {
//       //分化逻辑
//       handles[controller][action].apply(null, [req, res, ...args]);
//     } else {
//       res.writeHead(500);
//       res.end('control not found');
//     }
//   })
//   .listen(8124);

// MVC 手工映射
// const router = [];

// const use = function (path, action) {
//   //为了实现动态路径 将路径转为正则表达式
//   const keys = [];
//   router.push([
//     {
//       reg: pathToRegexp(path, keys),
//       keys,
//     },
//     action,
//   ]);
// };

// use('/user/setting', userSetting); //
// use('/user/:id/:hh', (req, res) => {
//   console.log(req.params);
//   res.end('user id');
// }); //动态路径匹配

// http
//   .createServer((req: any, res) => {
//     const pathname = url.parse(req.url).pathname; //URL
//     //根据URL找到对应的控制器和行为
//     router.forEach(route => {
//       //如果匹配上
//       const reg = route[0].reg;
//       const keys = route[0].keys;
//       const match = reg.exec(pathname);

//       if (match) {
//         const params = {};

//         for (let i = 0; i < keys.length; i++) {
//           params[keys[i].name] = match[i + 1];
//         }
//         const action = route[1];
//         req.params = params;
//         action(req, res);
//         return;
//       }
//     });
//   })
//   .listen(8124);

//MVC 自然映射
// 约定 路径形成路由
// http.createServer((req, res) => {
//   const pathname = url.parse(req.url).pathname; //URL
//   const paths = pathname.split('/');
//   const controller = paths[1] || 'index';
//   const action = paths[2] || 'index';
//   const params = paths.slice(3);

//   //通过路径获取文件

//   module = require('./controllers/' + controller);
//   //做接下来的处理
// });

//RESTful

// const routes = {
//   all: [],
// };
// const app = {};

// ['get', 'post', 'delete', 'put'].forEach(method => {
//   app[method] = function (path, action) {
//     routes[method].push([pathToRegexp(path), action]);
//   };
// });

// app.get('/user/setting');
// app.put('/user/setting');

// const match = function (pathname, route): boolean {
//   //与上述的MVC手工映射差不多我们这边是直接提取出来了

//   return true;
// };

// http.createServer((req, res) => {
//   const pathname = url.parse(req.url).path;
//   const mehod = req.method.toLocaleLowerCase();
//   if (routes.hasOwnProperty(mehod)) {
//     //根据请求分发
//     if (match(pathname, routes[mehod])) {
//     } else {
//     }
//   } else {
//     if (match(pathname, routes.all)) {
//       return;
//     }
//   }
// });
//中间件
//想要达到的效果 类型express
// app.use(querystring);
// app.use(cookie);
// app.use(session);
// app.get('/user/:username',getUser);
interface App {
  use?: (path: any) => void;
}

//路由对象
const routes = {
  all: [],
};

const app: App = {};

app.use = function (...middleware) {
  const handle = {
    path: pathToRegexp('/'),
    stack: middleware,
  };

  routes.all.push(handle);
};

const match = function (pathname, routes) {
  let stacks = [];
  routes.forEach((route, index) => {
    const matched = route.path.exec(pathname); //判断是否有匹配上
    if (matched) {
      stacks = stacks.concat(route.stack);
    }
  });

  return stacks;
};

const handle = function (req, res, stack) {
  const next = function () {
    const middleware = stack.shift(); //拿到首个中间件

    if (middleware) {
      middleware(req, res, next);
    }
  };

  next();
};

const middleware1 = function (req, res, next) {
  console.log('middleware1');
  next();
};

const middleware2 = function (req, res, next) {
  console.log('middleware2');
  next();
};

app.use(middleware2);
app.use(middleware1);

http
  .createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;

    //拿到中间件栈
    const middlewareStack = match(pathname, routes.all);

    if (middlewareStack.length) {
      handle(req, res, middlewareStack);
    }
    res.end('');
  })
  .listen(8124);
