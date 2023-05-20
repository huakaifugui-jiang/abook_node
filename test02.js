var i = 0;
var showMem = function () {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  i++;
  console.log(
    'Process: heapTotal ' +
      format(mem.heapTotal) +
      ' heapUsed ' +
      format(mem.heapUsed) +
      ' rss ' +
      format(mem.rss),
    i,
  );
  console.log('-----------------------------------------------------------');
};

// var useMem = function () {
//   var size = 20 * 1024 * 1024;
//   var arr = new Array(size);
//   for (var i = 0; i < size; i++) {
//     arr[i] = 0;
//   }
//   return arr;
// };

var useMem = function () {
  var size = 200 * 1024 * 1024;
  var buffer = new Buffer(size);
  for (var i = 0; i < size; i++) {
    buffer[i] = 0;
  }
  return buffer;
};

var total = [];

for (var j = 0; j < 30; j++) {
  //   useMem();
  showMem();
  total.push(useMem());
}
