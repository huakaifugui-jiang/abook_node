# ABOOK 的后端

## 环境配置

1. typescript 因为使用 ts，所以之后是需要进行编译的 tsconfig 就是配置编译的环境和配置选项
2. prettier 格式化插件
3. eslint 设置代码的规范 增加代码的健壮性
4. husky 和 lint-staged husky 是 git hook 钩子 可以在提交代码之前进行操作 比如进行 eslint lint-staged 是对暂存代码进行 eslint
5. 实时更新代码 目的是 在文件变化时可以实时的更新代码 此时需要用到三个包 rimraf（用于跨平台兼容 删除目录 dist） concurrently （用于可以同时执行几个命令 比如 tsc -w 和 nodemon） nodemon（用于实时监听文件的变化并且更新） 项目运行： npm run start 就可以实时运行项目了

## 构建 web 服务器
