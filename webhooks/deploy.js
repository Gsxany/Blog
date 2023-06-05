const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");
// let sendMail = require('./sendMail');
const SECRET = "Gsxany230705";
function sign(body) {
  // hash 算法 解析出来签名 和 密钥 比对
  return `sha1=${crypto.createHmac("sha1", SECRET).update(body).digest("hex")}`;
}

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  // 判断路径是否正确
  if (req.method === "POST" && req.url === "/deploy") {
    // 分次接受 发过来的请求体。收到一点 存一点 然后拿到完整的
    let buffers = [];
    req.on("data", (buffer) => {
      buffers.push(buffer);
    });
    req.on("end", () => {
      let body = Buffer.concat(buffers);
      let event = req.headers["x-github-event"]; // event = push; 请求头
      // github 请求来的时候 要传递请求体 另外还会传递一个 signature 过来 需要验证signature
      let signature = req.headers["x-hub-signature"]; // 签名 就是 设置的 密钥

      if (signature !== sign(body)) {
        return res.end("Not Allowed");
      }
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      if (event === "push") {
        console.log(
          "%c 🍜 event: ",
          "font-size:20px;background-color: #33A5FF;color:#fff;",
          event
        );
        // 开始部署   部署脚本
        let payload = JSON.parse(body); // 拿到 body
        // 这里就是执行 脚本名称  可以进行替换 🍓🍓🍓 - 这里就可以 监听多个了
        let child = spawn("sh", [`./server.sh`]); // 开启子进程 执行脚本~
        let buffers = [];
        child.stdout.on("data", (buffer) => {
          console.log(
            "%c 🥧 buffer: ",
            "font-size:20px;background-color: #7F2B82;color:#fff;",
            buffer
          );
          buffers.push(buffer);
        });
        child.stdout.on("end", () => {
          let logs = Buffer.concat(buffers).toString();
          const text = `
          <h1>部署日期： ${new Date()}</h1>
          <h1>部署人： ${payload.pusher.name}</h1>
          <h1>部署邮箱： ${payload.pusher.email}</h1>
          <h1>提交信息： ${
            payload.head_commit && payload.head_commit["message"]
          }</h1>
          <h1>提交信息： ${logs.replace("\r\n", "<br />")}</h1>
          `;
        });
      }
    });
  } else {
    res.end("Not Found");
  }
});

server.listen(1113, () => {
  console.log("webhook服务已经在 1113 端口上启动。✨✨✨ ~");
});
