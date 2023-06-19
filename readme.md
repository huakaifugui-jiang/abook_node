# ABOOK 的后端

## 环境配置

1. typescript 因为使用 ts，所以之后是需要进行编译的 tsconfig 就是配置编译的环境和配置选项
2. prettier 格式化插件
3. eslint 设置代码的规范 增加代码的健壮性
4. husky 和 lint-staged husky 是 git hook 钩子 可以在提交代码之前进行操作 比如进行 eslint lint-staged 是对暂存代码进行 eslint
5. 实时更新代码 目的是 在文件变化时可以实时的更新代码 此时需要用到三个包 rimraf（用于跨平台兼容 删除目录 dist） concurrently （用于可以同时执行几个命令 比如 tsc -w 和 nodemon） nodemon（用于实时监听文件的变化并且更新） 项目运行： npm run start 就可以实时运行项目了

## 构建 web 服务器

- 在构建 web 服务器之前我们需要知道一些前置知识。我们需要了解两台计算机之间该如何传递数据

### 互联网的组成

互联网的实现分成了好几层。每一层都有自己的功能，就像建筑一样，每一层都靠下一层来支持。

那么它是怎么分层的呢？每一层都有什么不一样的功能呢？

最为广泛的一种分层方式是 OSI（Open System Interconnect）模型，它将互联网分为七层。我们从最底下的一层开始

1.  物理层 (Physical Layer).

    - 两台电脑之间要相互通信，需要干什么？我们可以首先想一下 当人与人之间进行交流时，通常是通过声音来进行交流。当一个人说话时，声音会引起空气的振动，这些振动以波的形式传递到另一个人的耳朵中，被耳朵接收并转化为电信号，然后通过神经系统传递到大脑，最终被理解为声音和语言
    - 相同的，两台电脑通信也需要一种介质来进行传递信息。这些介质一般是（电缆、光缆、网卡、无线电波等）通过他们将电脑之间连接起来，因为电脑只能识别 0 和 1 所以这些介质传递的也是 0 和 1，它们可能是通过电信号等方式传播到另外一台电脑上然后再被解析出来成 0 和 1。 传递的数据也叫做数据帧(Data Frame)。

2.  数据链路层 (Data Link Layer) 当然单纯的 0 和 1 是没有任何意义的，必须规定解读的方式：多少个电信号才算一组？每个信号有什么意义？这就是<strong>数据链路层</strong>的作用。

    - 在早期，每家公司都有自己的电信号分组。逐渐的，一种叫做 “以太网”(Ethernet)的协议，占据了主导地位。以太网规定，一组电信号构成一个数据包，也就是数据帧。每一帧分成两个部分：标头（Head）和数据（Data）

      ![数据帧](http://www.ruanyifeng.com/blogimg/asset/201205/bg2012052904.png)

      "标头"包含数据包的一些说明项，比如发送者、接受者、数据类型等等；"数据"则是数据包的具体内容。

    - 上面提到，以太网数据包的"标头"，包含了发送者和接受者的信息。那么，发送者和接受者是如何标识呢？以太网规定，连入网络的所有设备，都必须具有"网卡"接口。数据包必须是从一块网卡，传送到另一块网卡。网卡的地址，就是数据包的发送地址和接收地址，这叫做 MAC 地址。

    - 现在我们的计算机已经知道了自己的 MAC 地址了，通过上面的标头的构成，我们可以看出我们要发送数据到另外一台计算机上也还需要考虑两个条件

      1. 一块网卡怎么会知道另一块网卡的 MAC 地址？

      答：是有一种 ARP 协议，可以解决这个问题。这个留到后面介绍，这里只需要知道，以太网数据包必须知道接收方的 MAC 地址，然后才能发送

      2. 其次，就算有了 MAC 地址，系统怎样才能把数据包准确送到接收方？

      在早期（现在是交换机与路由）以太网使用了一种很“原始”的方式来把数据包送到接收方，而是向本网络中的所有计算机发送，让每台计算机自己判断，是否为接收方。

      ![广播](https://www.ruanyifeng.com/blogimg/asset/201205/bg2012052907.png)

      上图中，1 号计算机向 2 号计算机发送一个数据包，同一个子网络的 3 号、4 号、5 号计算机都会收到这个包。它们读取这个包的"标头"，找到接收方的 MAC 地址，然后与自身的 MAC 地址相比较，如果两者相同，就接受这个包，做进一步处理，否则就丢弃这个包。这种发送方式就叫做"广播"（broadcasting）。

3.  网络层(Network Layer)

    1. 为什么我们需要网络层？

       以太网协议，依靠 MAC 地址发送数据。理论上，单单依靠 MAC 地址，上海的网卡就可以找到洛杉矶的网卡了，技术上是可以实现的。

       但是，这样做有一个重大的缺点。以太网采用广播方式发送数据包，所有成员人手一"包"，不仅效率低，而且局限在发送者所在的子网络。也就是说，如果两台计算机不在同一个子网络，广播是传不过去的。这种设计是合理的，否则互联网上每一台计算机都会收到所有包，那会引起灾难。

       互联网是无数子网络共同组成的一个巨型网络，很像想象上海和洛杉矶的电脑会在同一个子网络，这几乎是不可能的。

       因此，必须找到一种方法，能够区分哪些 MAC 地址属于同一个子网络，哪些不是。如果是同一个子网络，就采用广播方式发送，否则就采用"路由"方式发送。憾的是，MAC 地址本身无法做到这一点。它只与厂商有关，与所处网络无关。

       这就导致了<strong>网络层</strong>的诞生。它的作用是引进一套新的地址，使得我们能够区分不同的计算机是否属于同一个子网络。这套地址就叫做"网络地址"，简称"网址"。

       于是，"网络层"出现以后，每台计算机有了两种地址，一种是 MAC 地址，另一种是网络地址。两种地址之间没有任何联系，MAC 地址是绑定在网卡上的，网络地址则是管理员分配的，它们只是随机组合在一起。

       网络地址帮助我们确定计算机所在的子网络，MAC 地址则将数据包送到该子网络中的目标网卡。因此，从逻辑上可以推断，必定是先处理网络地址，然后再处理 MAC 地址。

    2. IP 协议

       规定网络地址的协议叫做 IP 协议。它所定义的地址，就被成为 IP 地址

       目前，广泛采用的 IP 协议第四版，简称 IPv4。这个版本规定网络地址由 32 个二进制位组成。

       ![IP地址](https://www.ruanyifeng.com/blogimg/asset/201205/bg2012052908.png)

       习惯上，我们用分成四段的十进制数表示 IP 地址，从 0.0.0.0 一直到 255.255.255.255。

       互联网上的每一台计算机，都会分配到一个 IP 地址。这个地址分成两个部分，前一部分代表网络，后一部分代表主机。比如，IP 地址 172.16.254.1，这是一个 32 位的地址，假定它的网络部分是前 24 位（172.16.254），那么主机部分就是后 8 位（最后的那个 1）。处于同一个子网络的电脑，它们 IP 地址的网络部分必定是相同的，也就是说 172.16.254.2 应该与 172.16.254.1 处在同一个子网络。

       但是，问题在于单单从 IP 地址，我们无法判断网络部分。还是以 172.16.254.1 为例，它的网络部分，到底是前 24 位，还是前 16 位，甚至前 28 位，从 IP 地址上是看不出来的。

       那么，怎样才能从 IP 地址，判断两台计算机是否属于同一个子网络呢？这就要用到另一个参数"子网掩码"（subnet mask）。

       所谓"子网掩码"，就是表示子网络特征的一个参数。它在形式上等同于 IP 地址，也是一个 32 位二进制数字，它的网络部分全部为 1，主机部分全部为 0。比如，IP 地址 172.16.254.1，如果已知网络部分是前 24 位，主机部分是后 8 位，那么子网络掩码就是 11111111.11111111.11111111.00000000，写成十进制就是 255.255.255.0。

       知道"子网掩码"，我们就能判断，任意两个 IP 地址是否处在同一个子网络。方法是将两个 IP 地址与子网掩码分别进行 AND 运算（两个数位都为 1，运算结果为 1，否则为 0），然后比较结果是否相同，如果是的话，就表明它们在同一个子网络中，否则就不是。

       比如，已知 IP 地址 172.16.254.1 和 172.16.254.233 的子网掩码都是 255.255.255.0，请问它们是否在同一个子网络？两者与子网掩码分别进行 AND 运算，结果都是 172.16.254.0，因此它们在同一个子网络。

       总结一下，IP 协议的作用主要有两个，一个是为每一台计算机分配 IP 地址，另一个是确定哪些地址在同一个子网络。

       3. ARP 协议 它位于位于网络层和数据链路层之间的协议，可以看作是两个层之间的桥梁。之前我们还没有解释要如何获取另一台计算机的 MAC 地址，这个协议就可以帮助我们去获取。

       因为 IP 数据包是放在以太网数据包里发送的，所以我们必须同时知道两个地址，一个是对方的 MAC 地址，另一个是对方的 IP 地址。通常情况下，对方的 IP 地址是已知的（后文会解释），但是我们不知道它的 MAC 地址。

       这里又可以分成两种情况。第一种情况，如果两台主机不在同一个子网络，那么事实上没有办法得到对方的 MAC 地址，只能把数据包传送到两个子网络连接处的"网关"（gateway），让网关去处理。

       第二种情况，如果两台主机在同一个子网络，那么我们可以用 ARP 协议，得到对方的 MAC 地址。ARP 协议也是发出一个数据包（包含在以太网数据包中），其中包含它所要查询主机的 IP 地址，在对方的 MAC 地址这一栏，填的是 FF:FF:FF:FF:FF:FF，表示这是一个"广播"地址。它所在子网络的每一台主机，都会收到这个数据包，从中取出 IP 地址，与自身的 IP 地址进行比较。如果两者相同，都做出回复，向对方报告自己的 MAC 地址，否则就丢弃这个包。

       总之，有了 ARP 协议之后，我们就可以得到同一个子网络内的主机 MAC 地址，可以把数据包发送到任意一台主机之上了。

所以，我们需要一种机制，能够从 IP 地址得到 MAC 地址。

4.  传输层(Transport Layer) 有了 IP 地址和 MAC 地址，我们已经可以在互联网上任意两台主机上建立通信。

    1.  传输层的由来
        接下来的问题是，同一台主机上有许多程序都需要用到网络，比如，你一边浏览网页，一边与朋友在线聊天。当一个数据包从互联网上发来的时候，你怎么知道，它是表示网页的内容，还是表示在线聊天的内容？

        也就是说，我们还需要一个参数，表示这个数据包到底供哪个程序（进程）使用。这个参数就叫做"端口"（port），它其实是每一个使用网卡的程序的编号。每个数据包都发到主机的特定端口，所以不同的程序就能取到自己所需要的数据。

        "端口"是 0 到 65535 之间的一个整数，正好 16 个二进制位。0 到 1023 的端口被系统占用，用户只能选用大于 1023 的端口。不管是浏览网页还是在线聊天，应用程序会随机选用一个端口，然后与服务器的相应端口联系。

    2.  UDP 协议 现在，我们必须在数据包中加入端口信息，这就需要新的协议。最简单的实现叫做 UDP 协议，它的格式几乎就是在数据前面，加上端口号。

        "标头"部分主要定义了发出端口和接收端口，"数据"部分就是具体的内容。然后，把整个 UDP 数据包放入 IP 数据包的"数据"部分，而前面说过，IP 数据包又是放在以太网数据包之中的，所以整个以太网数据包现在变成了下面这样：

        ![UDP数据包](https://www.ruanyifeng.com/blogimg/asset/201205/bg2012052912.png)

    3.  TCP 协议 UDP 协议的优点是比较简单，容易实现，但是缺点是可靠性较差，一旦数据包发出，无法知道对方是否收到。

        为了解决这个问题，提高网络可靠性，TCP 协议就诞生了。这个协议非常复杂，但可以近似认为，它就是有确认机制的 UDP 协议，每发出一个数据包都要求确认。如果有一个数据包遗失，就收不到确认，发出方就知道有必要重发这个数据包了。

        因此，TCP 协议能够确保数据不会遗失。它的缺点是过程复杂、实现困难、消耗较多的资源。

        TCP 数据包和 UDP 数据包一样，都是内嵌在 IP 数据包的"数据"部分。TCP 数据包没有长度限制，理论上可以无限长，但是为了保证网络的效率，通常 TCP 数据包的长度不会超过 IP 数据包的长度，以确保单个 TCP 数据包不必再分割。

5.  会议层(会话层)(Session Layer) 会话层负责建立、管理和终止会话（或连接） between 应用程序。它提供会话的控制和同步，允许不同设备之间的通信进行会话管理和错误恢复。

6.  表现层(表示层)(Presentation Layer) 表示层负责数据的格式转换、数据加密和压缩等功能，以确保在不同系统之间交换数据时的互操作性。它还处理数据的语法和语义问题，并提供数据格式转换和加密解密等服务。
7.  应用层(Application Layer) "应用层"的作用，就是规定应用程序的数据格式。

    举例来说，TCP 协议可以为各种各样的程序传递数据，比如 Email、WWW、FTP 等等。那么，必须有不同协议规定电子邮件、网页、FTP 数据的格式，这些应用程序协议就构成了"应用层"。

    这是最高的一层，直接面对用户。它的数据就放在 TCP 数据包的"数据"部分。因此，现在的以太网的数据包就变成下面这样。

    ![UDP数据包](https://www.ruanyifeng.com/blogimg/asset/201205/bg2012052913.png)

    至此，整个互联网的五层结构，自下而上全部讲完了。这是从系统的角度，解释互联网是如何构成的。

    参考链接[https://www.ruanyifeng.com/blog/2012/05/internet_protocol_suite_part_i.html]

### NodeJS 中的传输层与应用层

对于前端而言，通常接触的就是 http 协议，而 http 协议是基于 tcp 协议的。所以我们可以先从 tcp 协议来一步一步的去学习一下 http 协议。

首先我们创建一个 tcp 服务器。tcp 是面向连接的协议，其在传输之前需要 3 次握手形成会话。只有在会话形成之后，服务端与客户端之间才能互相发送数据。在创建会话的过程中，服务端和客户端分别提供一个套接字(socket)，这两个套接字共同形成一个连接。服务端与客户端则通过套接字实现两者之间的连接操作。

```typescript
//服务端创建一个 tcp服务器
const server = net.createServer(socket => {
  console.log('和客户端连接成功');

  socket.on('data', data => {
    console.log('接收到了客户端的信息', data.toString());
  });
});

server.on('connection', socket => {
  console.log('创建了一次连接');
});

server.listen(8124, () => {
  console.log('TCP server running on port 8124');
});
```

这边直接测试 http 客户端连接 tcp 服务端了，运行 npm run start 后,我们直接在浏览器中输入http://127.0.0.1:8124/ 会发现已经建立了一次连接了，每刷新一次就会创建一个新的连接。我们可以看到客户端给我们发送的数据也就是 http 请求报文 ： 如下

```shell
GET / HTTP/1.1 # 请求方法 路径 和 http协议版本
Host: 127.0.0.1:8124 # 请求的目标主机和端口
Connection: keep-alive #请求完成后保持TCP连接 保持连接 可以不需要每次请求都重新创建连接
Cache-Control: max-age=0 # 指示缓存的控制策略，max-age=0表示每次请求都需要向服务器验证是否有最新的资源。
sec-ch-ua: "Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114" # 指示浏览器的用户代理信息
sec-ch-ua-mobile: ?0 # 指示客户端浏览器的用户代理移动设备信息
sec-ch-ua-platform: "Windows" # 客户端浏览器的用户代理操作系统平台信息
Upgrade-Insecure-Requests: 1 # 请求升级为安全连接（HTTPS）
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 # 用户代理标识，指示浏览器和操作系统信息
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7  # 客户端可接受的媒体类型
Sec-Fetch-Site: none # 指示请求来源的安全性
Sec-Fetch-Mode: navigate # 指示请求的目标资源如何获取
Sec-Fetch-User: ?1 # 指示请求来源的用户类型
Sec-Fetch-Dest: document # 指示请求的目标资源类型
Accept-Encoding: gzip, deflate, br  # 客户端可接受的内容编码方式
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7 # 客户端可接受的自然语言
```

我们会发现此时我们在浏览器上是什么都看不到的，因为我们发送的数据并不符合 http 报文 所以我们可以在上面加上 符合 http 报文 的响应数据

```typescript
import net from 'net';

const server = net.createServer(socket => {
  console.log('和客户端连接成功');

  socket.on('data', data => {
    console.log('接收到了客户端的信息', data.toString());

    // 构造HTTP响应
    const responseBody = 'Hello, World!';
    const response = `HTTP/1.1 200 OK\r\n\Content-Length: ${responseBody.length}\r\n\r\n${responseBody}`;

    // 发送HTTP响应
    socket.write(response);
  });
});

server.on('connection', socket => {
  console.log('创建了一次连接');
});

server.listen(8124, () => {
  console.log('TCP server running on port 8124');
});
```

此时我们就可以在页面上看到 Hello, World! 了，但是这样属实是十分麻烦，所以 Node 也给我们提供了 http 模块，它包含了对 HTTP 处理的封装。在 Node 中,Http 服务继承自 TCP 服务器，它能够与多个客户端保持连接，由于采用事件驱动，并不为每个连接创建 额外的线程或进程，保持很低的内存占用所以能实现高并发。

http 模块是将 connection 到 request 的过程进行了封装，http 以 request 为单位进行服务(tcp 是 connection 为单位也就是每次连接)，它将套接字 socket 的读写抽象为了 ServerRequest 和 ServerResponse 对象，分别对应请求和响应操作。

会将我们上述的请求报文进行 http_parser 解析，成为 key:value 的形式

具体可以查看 node 文档 的 http 模块

### 业务逻辑分发

在实际的运用场景中，我们不可以把所有的代码都集中在一起，所以我们会通过一定的方法将业务逻辑代码分发出去。

1.  请求方法 分发
    我们可以通过请求方法来觉得响应行为

    ```typescript
    //根据请求方法 将业务逻辑进行分发
    function get(req, res) {
      console.log('来到了GET逻辑');
      res.write('get');
    }
    function post(req, res) {
      console.log('来到了 Post 逻辑');
      res.write('post');
    }

    http
      .createServer((req, res) => {
        switch (req.method) {
          case 'GET':
            get(req, res);
            break;
          case 'POST':
            post(req, res);
            break;
        }

        res.end();
      })
      .listen(8124);
    ```

2.  根据路径

    ```typescript
    http
    .createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    //在 dist 目录下创建一个 a.js 文件
    fs.readFile(path.join(\_\_dirname, pathname + '.js'), (err, file) => {
    if (err) {
    res.writeHead(404);
    res.end('404 NOT FOUND');
    return;
    }

        res.writeHead(200);
        res.end(file);

    });
    })
    .listen(8124);
    ```

3.  根据路径选择控制器
    还有一种比较常见的分发场景是根据路径来选择控制器，它预设路径为控制器和行为的组合，无须额外配置路由信息，如下所示：

    ```
    /controller/action/a/b/c
    ```

    这里的 controller 会对应到一个控制器，action 对应到控制器的行为，剩余的值会作为参数进行一些别的判断。这样我们的业务部分可以只关心具体的业务实现，如下所示

    ```typescript
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
        if (handles[controller] && handles[controller][action]) {
          //分化逻辑
          handles[controller][action].apply(null, [req, res, ...args]);
        } else {
          res.writeHead(500);
          res.end('control not found');
        }
      })
      .listen(8124);
    ```

#### MVC

MVC 的模型主要思想是将业务逻辑按职责分离。

1. 控制器（Controller）一组行为的集合。
2. 模型(Model)数据相关的操作和封装
3. 视图(View)视图的渲染

它的工作模式如下：

1. 路由解析，根据 URL 寻找到对应的控制器和行为。
2. 行为调用相关的模型，进行数据操作
3. 数据操作结束后，调用视图和相关数据进行页面渲染，输出到客户端

我们可以一步一步的去实现这一功能

##### 根据 URL 做路由映射

这里有两种实现方式 1.通过手工关联映射（express），一种是自然关联映射。前者会有一个对应的路由文件来将 URL 映射到对应的控制器，后者没有这样的文件

1. 手功映射

除了需要维护路由表之外基本没有任何的缺点。 但是要是 api 多起来是真的太多了。

```typescript
const router = [];

const use = function (path, action) {
  //为了实现动态路径 将路径转为正则表达式
  const keys = [];
  router.push([
    {
      reg: pathToRegexp(path, keys),
      keys,
    },
    action,
  ]);
};

use('/user/setting', userSetting); //
use('/user/:id/:hh', (req, res) => {
  console.log(req.params);
  res.end('user id');
}); //动态路径匹配

http
  .createServer((req: any, res) => {
    const pathname = url.parse(req.url).pathname; //URL
    //根据URL找到对应的控制器和行为
    router.forEach(route => {
      //如果匹配上
      const reg = route[0].reg;
      const keys = route[0].keys;
      const match = reg.exec(pathname);

      if (match) {
        const params = {};

        for (let i = 0; i < keys.length; i++) {
          params[keys[i].name] = match[i + 1];
        }
        const action = route[1];
        req.params = params;
        action(req, res);
        return;
      }
    });
  })
  .listen(8124);
```

2. 自然映射

通过约定，我们将文件路径与 api 地址挂钩 这样就不用维护路由表了，但是缺点也很明显，如果接口 controller 需要改名那么文件也要跟着迁移

```typescript
http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname; //URL
  const paths = pathname.split('/');
  const controller = paths[1] || 'index';
  const action = paths[2] || 'index';
  const params = paths.slice(3);

  //通过路径获取文件

  module = require('./controllers/' + controller);
  //做接下来的处理
});
```

##### RESTful

RESTful (representational state transfer) 表现层状态转化。它的设计哲学主要将服务端提供 内容实体看作一个资源，并表现再 URL 上。

比如一个用户的地址：/users/jack

这个地址代表了一个资源，对这个资源的操作主要体现再 HTTP 请求方法上，不是体现再 URL 上。
过去我们对用户的增删改查或许是如下设计的

POST /user/add?username=jack
GET /user/remove?username=jack
GET /user/get?username=jack

操作的行为体现再 url 上面，主要用到的请求方法是 POST 和 GET。再 RESTful 设计中，它是如下的

POST /user/jack
DELETE /user/jack
PUT /user/jack
GET /user/jack

它将请求方法引入设计中，参与资源的操作和更改资源的状态。

再 RESTful 中，资源的具体格式由请求报头中的 Accept 字段和服务端的支持情况来决定。如果客户端同时接收 JSON 和 XML 格式的响应，那么它的 Accept 字段是如下：

Accept：application/json,application/xml

靠谱的服务端应该要顾及这个字段，然后根据自己能响应的格式做出响应。再响应报文中，通过 Content-Type 字段告知客户端是什么格式：

Content-Type:application/json

总结来说，RESTful 设计就是通过 URL 设计资源、请求方法定义资源操作，通过 Accept 决定资源的表现形式

所以我们可以改进我们路由

```typescript
const routes = {
  all: [],
};
const app = {};

['get', 'post', 'delete', 'put'].forEach(method => {
  app[method] = function (path, action) {
    routes[method].push([pathToRegexp(path), action]);
  };
});

app.get('/user/setting');
app.put('/user/setting');

const match = function (pathname, route): boolean {
  //与上述的MVC手工映射差不多我们这边是直接提取出来了

  return true;
};

http.createServer((req, res) => {
  const pathname = url.parse(req.url).path;
  const mehod = req.method.toLocaleLowerCase();
  if (routes.hasOwnProperty(mehod)) {
    //根据请求分发
    if (match(pathname, routes[mehod])) {
    } else {
    }
  } else {
    if (match(pathname, routes.all)) {
      return;
    }
  }
});
```
