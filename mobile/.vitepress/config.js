module.exports = {
  title: "Gsxany",
  base: "/",
  description: "Keep on going never give up",
  head: [
    // 添加图标
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],
  searchMaxSuggestions: 10,
  lastUpdated: true,
  themeConfig: {
    logo: "avatar.jpg",
    smoothScroll: true,
    nav: [
      {
        text: "首页",
        link: "/",
      },
      {
        text: "引导",
        items: [],
      },
      {
        text: "Github",
        link: "https://github.com/gsxany",
        target: "_blank",
      },
      {
        text: "其他",
        items: [
          {
            text: "微博",
            link: "https://weibo.com/u/7842190617",
            target: "_blank",
          },
          {
            text: "微信",
            link: "https://www.gsxany.com/qr-code/wx/",
            target: "_blank",
          },
          {
            text: "Gitee(码云)",
            link: "https://gitee.com/gsxany",
            target: "_blank",
          },
        ],
      },
    ],
    sidebar: [
      {
        text: "首页",
        link: "/",
        collapsable: false,
      },
    ],
  },
};
