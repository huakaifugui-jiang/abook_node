import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

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

const handles = {
  pagelist: {
    getlist: function (req, res, ...args) {
      console.log(args, 'getlist');

      res.end('getList');
    },
  },
  index: {
    index: function (req, res, ...args) {
      console.log(args, 'index');

      res.end('index');
    },
  },
};

http
  .createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;

    const paths = pathname.split('/');
    const controller = paths[1] || 'index'; //控制器
    const action = paths[2] || 'index'; //行为
    const args = paths.slice(3); //剩余的参数
    if (handles[controller] && handles[controller][action]) { //分化逻辑
      handles[controller][action].apply(null, [req, res, ...args]);
    } else {
      res.writeHead(500);
      res.end('control not found');
    }
  })
  .listen(8124);
