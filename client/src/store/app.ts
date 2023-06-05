import { observable, action, makeObservable } from "mobx";
import homeBG from "image/home--bg.jpg";
import catalogueBG from "image/catalogue--bg.jpg";
import aboutBG from "image/about--bg.jpg";
import { navList } from "utils/dataMap";

export interface IHeaderItemModel {
  headerTitle: string;
  headerDesc: string;
  headerImg: string;
  headerTag?: string;
  headerTagColor?: string;
  headerTagFontColor?: string;
}
export interface IHeaderModel {
  [propName: string]: IHeaderItemModel;
}

export default class SApp {
  constructor() {
    makeObservable(this);
  }

  @observable siteTag = "Gsxany";
  @observable loading = false;
  @observable activeTag = sessionStorage.getItem("activeTag") || "Home";
  @observable searchVal = "";
  @observable headerStyle = {
    headerTitle: this.siteTag,
    headerDesc: "Keep on going never give up",
    headerImg: `url(${homeBG})`,
    headerTag: "",
    headerTagColor: "",
    headerTagFontColor: "#fff",
  };

  @action CHANGE_LOADING: (status: boolean) => void = (status) => {
    this.loading = status;
  };
  @action CHANGE_ACTIVE_TAG: (tag: string) => void = (tag) => {
    this.activeTag = tag;
  };
  @action CHANGE_SEARCH_VAL: (val: string) => void = (val) => {
    this.searchVal = val;
  };
  @action CHANGE_HEADER_STYLE: (
    headerTag: string,
    headerModel?: IHeaderItemModel
  ) => void = (headerTag, headerModel) => {
    const dispathNavFun: IHeaderModel = {
      Home: {
        headerTitle: this.siteTag,
        headerDesc: "Keep on going never give up",
        headerImg: `url(${homeBG})`,
        headerTag: "",
      },
      Catalogue: {
        headerTitle: "Catalogue",
        headerDesc: "Here is the information you need",
        headerImg: `url(${catalogueBG})`,
        headerTag: "",
      },
      About: {
        headerTitle: "About",
        headerDesc: "Hi，⁽⁽ଘ( ˊᵕˋ )ଓ",
        headerImg: `url(${aboutBG})`,
        headerTag: "",
      },
    };
    if (navList.some((_nav) => _nav.tag === headerTag)) {
      this.headerStyle = {
        ...this.headerStyle,
        ...dispathNavFun[headerTag],
      };
    } else {
      this.headerStyle = {
        ...this.headerStyle,
        ...headerModel,
      };
    }
  };
}
