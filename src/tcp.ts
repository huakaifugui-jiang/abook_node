import net from 'net';

const clinet = net.connect({ port: 8124 }, () => {
  console.log('client connet');
  clinet.write('client hhh');
});

clinet.on('data', function (data) {
  console.log(data.toString());
  clinet.end();
});
clinet.on('end', function () {
  console.log('client disconnected');
});
