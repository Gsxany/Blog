module.exports = (router) => {
  router.prefix("/api");
  /**
   * @route /
   * @desc 测试链接 是否 正常
   * @access ~public
   */
  router.get("/", async (ctx, next) => {
    ctx.state = {
      title: "Gsxany",
    };
    ctx.status = 200;
    ctx.body = "链接成功~";
    await ctx.render("index", ctx.state);
  });

  require("./blog")(router);
  require("./tag")(router);
};
