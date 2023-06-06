import net from 'net';

const server = net.createServer(socket => {
  console.log('Client connected');

  socket.on('data', data => {
    console.log('Received data');

    // 构造HTTP响应
    const responseBody = 'Hello, World!';
    const response = `HTTP/1.1 200 OK\r\n\Content-Length: ${responseBody.length}\r\n\r\n${responseBody}`;

    // 发送HTTP响应
    socket.write(response);
  });
});

server.on('connection', socket => {
  console.log('connetction');
  socket.on('data', data => {
    console.log('conection data',data.toString());
  });
});

server.listen(8124, () => {
  console.log('TCP server running on port 8124');
});

