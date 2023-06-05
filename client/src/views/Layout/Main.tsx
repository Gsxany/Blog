import React, { FC } from "react";
import { observer } from "mobx-react";
import { Route, Routes } from "react-router";
import { useLocation } from "react-router-dom";
import { Aside } from "./Aside";
import { Home } from "views/Home";
import { Catalogue } from "views/Catalogue";
import { About } from "views/About";
import { BlogDetail } from "views/BlogDetail";
import { Space, Spin } from "antd";
import styled from "@emotion/styled";
import { FlexBlock } from "style/common";
import { useStores } from "store";
import { NoMatch } from "views/NoMatch";

export const Main: FC = observer(() => {
  const routes = useLocation();
  const { sApp } = useStores();
  const specifyRoutes = ["/catalogue", "/home", "/about", "/"];
  const currentRoute = routes.pathname.split("/")[1];

  return (
    <div>
      {sApp.loading && (
        <LoadingBox size="middle" loading={sApp.loading ? 1 : 0}>
          <Spin tip="loading..." spinning={sApp.loading} />
        </LoadingBox>
      )}

      <MainBox loading={sApp.loading ? 1 : 0}>
        <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/home"} element={<Home />} />
          <Route path={"/catalogue/"} element={<Catalogue />} />
          <Route path={"/catalogue/:id"} element={<Catalogue />} />
          <Route path={"/about"} element={<About />} />
          <Route path={"/blog-detail/:id"} element={<BlogDetail />} />
          <Route path={"*"} element={<NoMatch />} />
        </Routes>
        {specifyRoutes.includes(`/${currentRoute}`) ? <Aside /> : null}
      </MainBox>
    </div>
  );
});

const LoadingBox = styled(Space)<{
  loading?: number;
}>`
  min-height: ${({ loading }) => (loading ? "35rem" : "0")};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MainBox = styled(FlexBlock)<{
  loading: number;
}>`
  display: ${({ loading }) => (loading ? "none" : "flex")};
  align-items: stretch;
`;
