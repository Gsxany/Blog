const fs = require("fs");
const path = require("path");

/**
 * 去掉 .md 后缀
 */
const removeSuffix = (fileName) => {
  return fileName.replace(".md", "");
};

/**
 * @description 生成首字母大写的文件夹名称
 * @author guolin
 * @param {*} fileName
 * @e.g {*} genFileRuleName(js) => Js
 */
const genFileRuleName = (fileName) => {
  const name = fileName[0].toUpperCase() + fileName.substr(1);
  return name;
};

/**
 * 当前 markdown 的存储文件夹名称
 */
const curMdFileName = "docs";
const buildConfig = () => {
  const mdDirPath = path.resolve(`./${curMdFileName}`);
  const dirs = fs.readdirSync(mdDirPath); // 读取 pages 下的所有文件夹
  const navbarList = buildNavbar(dirs);
  const sidebarList = buildSidebar(dirs, mdDirPath);
  const configTemPath = path.resolve(`./build/temConfig.js`);

  const configTemText = fs
    .readFileSync(configTemPath, "utf-8")
    .replace("sidebar,", `sidebar: ${JSON.stringify(sidebarList, null, 2)},`)
    .replace("nav,", `nav: ${JSON.stringify(navbarList, null, 2)},`);
  fs.writeFile(
    "./.vitepress/config.js",
    configTemText,
    { encoding: "utf-8" },
    (err) => {
      if (err) console.log("write file err: ", err);
    }
  );
};

/**
 * 构建 Nav
 */
const buildNavbar = (dirs) => {
  // 当前固定 引导坐标为 1 (数组下标)
  const GUIDE_INDEX = 1;
  const GITHUB_URI = "https://github.com/gsxany";
  const WEIBO_URI = "https://weibo.com/u/7842190617";
  const WECHAT_URI = "https://www.gsxany.com/qr-code/wx/";
  const GITEE_URI = "https://gitee.com/gsxany";
  const _navbarList = [
    { text: "首页", link: "/" },
    {
      text: "引导",
      items: [],
    },
    { text: "Github", link: GITHUB_URI, target: "_blank" },
    {
      text: "其他",
      items: [
        { text: "微博", link: WEIBO_URI, target: "_blank" },
        { text: "微信", link: WECHAT_URI, target: "_blank" },
        { text: "Gitee(码云)", link: GITEE_URI, target: "_blank" },
      ],
    },
  ];
  dirs.forEach((_dirName) => {
    if (_dirName === ".DS_Store") return false;
    const _currentPathModel = {
      text: genFileRuleName(_dirName),
      link: `/${curMdFileName}/${_dirName}/`,
    };
    _navbarList[GUIDE_INDEX].items.push(_currentPathModel);
  });
  return _navbarList;
};
/**
 * 构建 Sidebar
 */
const buildSidebar = (dirs, mdDirPath) => {
  const _sidebarList = [
    {
      text: "首页",
      link: "/",
      collapsable: false,
    },
  ];
  const genSideBarItem = (_fileDirs, curPath, flag) => {
    return _fileDirs
      .map((_dir) => {
        if (~["index.md", ".DS_Store"].indexOf(_dir)) return false;
        const itemLinkPath = `${curPath}/${_dir}`;
        const _currentPathModel = {
          text: removeSuffix(genFileRuleName(_dir)),
          link: removeSuffix(itemLinkPath + `${!flag ? "/index" : ""}`),
        };
        const childDirPath = `${mdDirPath}/${_dir}`;
        if (!/\.md$/g.test(childDirPath)) {
          const childDirs = fs.readdirSync(childDirPath);
          if (childDirs && Array.isArray(childDirs) && childDirs.length) {
            (
              _currentPathModel.children || (_currentPathModel.children = [])
            ).push(...genSideBarItem(childDirs, itemLinkPath, true));
          }
        }
        return _currentPathModel;
      })
      .filter((_file) => _file);
  };
  _sidebarList.push(...genSideBarItem(dirs, `/${curMdFileName}`, false));
  return _sidebarList;
};

buildConfig();
