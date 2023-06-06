import net from 'net';

const server = net.createServer(socket => {
  console.log('Client connected');

  socket.on('data', data => {
    console.log('Received data:', data.toString());

    if (data.toString() === 'SYN-ACK') {
      // 第三次握手：服务器收到ACK包
      console.log('Received ACK from client');
      console.log('TCP handshake completed');
    }

    // 构造SYN-ACK响应
    // const response = 'SYN-ACK';

    // 发送SYN-ACK响应
    // socket.write('SYN-ACK');

    // 构造HTTP响应
    const responseBody = 'Hello, World!';
    const response = `HTTP/1.1 200 OK\r\nContent-Length: ${responseBody.length}\r\n\r\n${responseBody}`;

    // 发送HTTP响应
    socket.write(response);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', error => {
    console.error('Socket error:', error);
  });
});

server.on('connection', data => {
  console.log('connetction');
});

server.listen(8124, () => {
  console.log('TCP server running on port 8124');
});
