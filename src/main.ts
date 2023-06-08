import http from 'http';
import url from 'url';

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

//根据路径进行判断。

http
  .createServer((req, res) => {
    console.log(req.url, req.headers.host);
    res.end();
  })
  .listen(8124);

