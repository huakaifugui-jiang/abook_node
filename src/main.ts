import http from 'http';

const app = http.createServer((req, res) => {
  console.log(req.method);
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!');
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
