import React, { FC } from "react";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { Main } from "./Main";
import { BackTop } from "antd";
import { UpCircleOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";

export const Layout: FC = () => {
  const routes = useLocation();
  const noShowLayout = ["edit-md", "qr-code"];
  const currentRoute = routes.pathname.split("/")[1];

  return (
    <>
      {!noShowLayout.includes(currentRoute) ? (
        <>
          <Header />

          <ContentBox>
            <Main />
          </ContentBox>

          <Footer />

          <BackTop>
            <BackTopIcon />
          </BackTop>
        </>
      ) : null}
    </>
  );
};

const BackTopIcon = styled(UpCircleOutlined)`
  font-size: 2.2rem;
`;
const ContentBox = styled.div`
  padding: 3.6rem 0rem 6rem;
`;
