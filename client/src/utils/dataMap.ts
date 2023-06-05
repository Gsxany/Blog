export interface INavItem {
  title?: string;
  tag?: string;
  link?: string;
}

export interface ITagItem {
  _id: string;
  name: string;
  color: string;
  fontColor: string;
  count: string | number;
}

export interface IBlogItem {
  _id: string;
  title: string;
  desc?: string;
  body?: string;
  isTop: boolean;
  // auth: string;
  tagInfo?: ITagItem;
  createDate: string | number;
  updateDate: string | number;
}

export const navList: INavItem[] = [
  {
    title: "首页",
    tag: "Home",
    link: "/home",
  },
  {
    title: "目录",
    tag: "Catalogue",
    link: "/catalogue",
  },
  {
    title: "关于我",
    tag: "About",
    link: "/about",
  },
];

// 暂存
export const tagColorMap: string[] = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];
