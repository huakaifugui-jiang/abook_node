let isType = function (type) {
  return function (obj) {
    console.log(obj);
    return toString.call(obj) == `[object ${type}]`;
  };
}; //工厂函数

var isString = isType('String');
console.log(isString(123));
function async() {
  process.nextTick(() => {
    try {
      throw new Error(123);
    } catch (error) {
      console.log(error, '12312');
    }
  });
}

try {
  async();
} catch (err) {
  console.log('error', err);
}

const a = 123212121212121212121212121212121212121212121212121212121212121212121212121212121212121212121;