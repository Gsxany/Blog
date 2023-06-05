import React, { FC, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { INavItem, navList } from "utils/dataMap";
import { useDOMScroll } from "utils/useCallback";
import styled from "@emotion/styled";
import { FlexBlock, UserNoSelect } from "style/common";
import { useStores } from "store";
import { Tag, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { observer } from "mobx-react";
import EventBus from "utils/eventBus";

export const Header: FC = observer(() => {
  const navigate = useNavigate();
  const routes = useLocation();

  const { sApp } = useStores();
  // 头部内容 初始化~
  const [navStatus, setNavStatus] = useState("static");
  const [navModel, setNavModel] = useState({
    font: "#fff",
    background: "rgba(0, 0, 0, 0.3)",
    borderColor: "",
  });
  const [scrolllTop] = useDOMScroll();

  const toggleNavActive: (_nav: INavItem) => void = (_nav) => {
    sApp.CHANGE_ACTIVE_TAG(_nav?.tag || "Home");
    sApp.CHANGE_HEADER_STYLE(_nav?.tag || "Home");
  };

  useEffect(() => {
    let curRoute = "Home";
    const currentRoute = routes.pathname.split("/")[1];
    const matchRouteTag = navList.find((_nav) => {
      return (
        _nav.tag?.toLocaleUpperCase() === currentRoute?.toLocaleUpperCase()
      );
    });
    curRoute = matchRouteTag?.tag || "Home";
    if (matchRouteTag || routes.pathname === "/") {
      toggleNavActive({ tag: curRoute });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes.pathname]);

  let cacheTop = useRef(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      // 判断滚动高度是否大于 399 然后设置背景颜色~
      if (scrolllTop > 399) {
        setNavModel({
          ...navModel,
          font: "#000",
          background: "rgba(255, 255, 255, 0.9)",
          borderColor: "#eee",
        });
      } else {
        setNavModel({
          ...navModel,
          font: "#fff",
          background: "rgba(0, 0, 0, 0.3)",
          borderColor: "",
        });
      }
      // 判断向上向下滚动 设置浮动~
      if (scrolllTop > cacheTop.current) {
        setNavStatus("static");
      } else {
        setNavStatus("active");
      }
      cacheTop.current = scrolllTop;
    }, 111);
    return () => clearInterval(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolllTop]);
  const handleSkipHome: (urlParams?: string) => void = (urlParams = "") => {
    navigate("/home" + urlParams);
    toggleNavActive({ tag: "Home" });
  };
  const handleClickLogo = () => {
    handleSkipHome();
  };

  const [searchStatus, setSearchStatus] = useState(false);
  const searchGesture = (type = "leave") => {
    if (sApp.searchVal.trim()) {
      setSearchStatus(true);
      return;
    }
    setSearchStatus(type === "leave" ? false : true);
  };
  const searchValChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sApp.CHANGE_SEARCH_VAL(e.target.value || "");
  };
  const handleSearch = () => {
    if (!searchStatus) return false;
    const searchStr = sApp.searchVal.trim()
      ? `?search=${sApp.searchVal.trim()}`
      : "";
    handleSkipHome(searchStr);
    EventBus.emit("fetchBlogList", sApp.searchVal.trim());
  };
  const searchSuffix = (
    <SearchOutlined
      style={{
        fontSize: 16,
        color: "#42b983",
      }}
      onClick={handleSearch}
    />
  );
  return (
    <HeaderBox headerBgImg={sApp.headerStyle?.headerImg}>
      <HeaderMain>
        <HeaderTitle>
          {sApp.headerStyle?.headerTitle}
          {sApp.headerStyle?.headerTag ? (
            <HeaderTag color={sApp.headerStyle?.headerTagColor}>
              <span style={{ color: sApp.headerStyle?.headerTagFontColor }}>
                {sApp.headerStyle?.headerTag}
              </span>
            </HeaderTag>
          ) : null}
        </HeaderTitle>
        <HeaderDesc>{sApp.headerStyle?.headerDesc}</HeaderDesc>
      </HeaderMain>

      <NavBox
        navBgc={navModel.background}
        className={navStatus === "active" ? "navbox--active" : ""}
        navBorderColor={navModel.borderColor}
      >
        <NavTitle fontColor={navModel.font} onClick={handleClickLogo}>
          {sApp.siteTag}
        </NavTitle>
        <NavMain>
          <NavSearch>
            {
              <NavSearchMain
                searchStatus={searchStatus}
                onMouseEnter={() => searchGesture("enter")}
                onMouseLeave={() => searchGesture("leave")}
              >
                <Input
                  placeholder="搜索相关内容"
                  suffix={searchSuffix}
                  onChange={searchValChange}
                  onPressEnter={handleSearch}
                  value={sApp.searchVal}
                />
              </NavSearchMain>
            }
          </NavSearch>
          <Nav>
            {navList.map((_nav) => {
              return (
                <NavItem
                  key={_nav.tag}
                  fontColor={navModel.font}
                  actived={sApp.activeTag === _nav.tag}
                >
                  <Link
                    to={`${_nav.link}`}
                    onClick={() => toggleNavActive(_nav)}
                  >
                    {_nav.title}
                  </Link>
                </NavItem>
              );
            })}
          </Nav>
        </NavMain>
      </NavBox>
    </HeaderBox>
  );
});

const HeaderBox = styled(UserNoSelect)<{
  headerBgImg?: string;
}>`
  width: 100vw;
  height: 39.9rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: 60% 80%;
  position: relative;
  z-index: 999;
  background-image: ${({ headerBgImg }) => headerBgImg || undefined};
  background-color: ${({ headerBgImg }) => headerBgImg || undefined};
`;
const HeaderMain = styled(FlexBlock)`
  width: 100%;
  height: 100%;
  position: absolute;
  flex-direction: column;
  color: #fff;
  font-size: 1.6rem;
  z-index: 3;
`;
const HeaderTag = styled(Tag)`
  position: absolute;
  top: 1.5rem;
  margin-left: 0.3rem;
`;
const HeaderTitle = styled.p`
  font-size: 6rem;
  font-weight: 700;
  margin-bottom: 0;
  position: relative;
`;
const HeaderDesc = styled.p`
  color: #fff;
`;
const NavBox = styled(FlexBlock)<{
  navBgc?: string;
  navBorderColor?: string;
}>`
  width: 100vw;
  height: 0;
  justify-content: space-between;
  padding: 0 60px;
  font-weight: bold;
  background-color: ${({ navBgc }) => navBgc || undefined};
  position: fixed;
  opacity: 0;
  transition: all ease 1s;
  z-index: 9;
  border: 1px solid;
  border-color: ${({ navBorderColor }) => navBorderColor || "transparent"};
  &.navbox--active {
    height: 6rem;
    opacity: 1;
  }
`;
const NavTitle = styled.div<{
  fontColor?: string;
}>`
  font-weight: bold;
  font-size: 2.6rem;
  cursor: pointer;
  color: ${({ fontColor }) => fontColor || "#fff"};
`;
const NavMain = styled.div`
  display: flex;
  align-items: center;
`;
const NavSearch = styled.div``;
const NavSearchMain = styled.div<{
  searchStatus?: boolean;
}>`
  .ant-input-affix-wrapper {
    font-size: 16px;
    width: ${({ searchStatus }) => (searchStatus ? "180px" : "35px")};
    height: 35px;
    transition: ${({ searchStatus }) => (searchStatus ? "width .8s" : "")};
    background-color: #fff;
    border-color: #ccc;
    border-radius: ${({ searchStatus }) => (searchStatus ? "20px" : "50%")};
    color: #333;
    display: flex;
    align-items: center;
    justify-content: ${({ searchStatus }) => (searchStatus ? "" : "center")};
    cursor: ${({ searchStatus }) => (searchStatus ? "pointer" : "pointer")};
    margin: 5px 10px 0 0;
    input {
      font-size: 14px;
    }
    .ant-input-suffix {
      margin-left: ${({ searchStatus }) => (searchStatus ? "4px" : "0")};
    }
  }
`;
const Nav = styled.div`
  display: flex;
`;
const NavItem = styled.span<{
  actived?: boolean;
  fontColor?: string;
}>`
  margin: 0 2rem;
  font-size: 1.4rem;
  display: block;
  position: relative;
  cursor: pointer;
  &::after {
    content: "";
    position: absolute;
    width: 150%;
    height: 5px;
    bottom: -18px;
    left: -20%;
    border-radius: 3px;
    background-color: ${({ actived }) => (actived ? "#AAABD3" : "transparent")};
  }
  a {
    color: ${({ actived, fontColor }) =>
      actived ? "#42b983" : fontColor ? fontColor : "#fff"};
    &:hover {
      color: #42b983;
    }
  }
`;
