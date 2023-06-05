const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const router = new Router();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const passport = require("koa-passport");
const mongoose = require("mongoose");
const cors = require("koa2-cors");

const { port, mongoURL: db } = require("./config");
const routes = require("./routes");

onerror(app);

// middlewares
app
  .use(
    bodyparser({
      enableTypes: ["json", "form", "text"],
    })
  )
  .use(json())
  .use(logger())
  .use(require("koa-static")(__dirname + "/public"))
  .use(
    views(__dirname + "/views", {
      extension: "pug",
    })
  )
  .use(
    cors({
      // http://localhost:3333
      origin: "*", // 只允许http://localhost:3333域名请求
      credentials: true, //是否允许发送Cookie
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //设置所允许的HTTP请求方法
      allowHeaders: ["Content-Type", "Authorization", "Accept"], //设置服务器支持的所有头信息字段
      // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use(router.routes());

// connect-mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb connectd... ✨✨✨");
  })
  .catch((err) => {
    console.log("🍒err=" + err);
  });

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

/**
 * routes
 * app.use(index.routes(), index.allowedMethods());
 * require('./config/passport')(passport)
 */
// require('./routes/index')(router);
routes(router);

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app.listen(port, () => {
  console.log(`Listening run on http://localhost:${port}`);
});
