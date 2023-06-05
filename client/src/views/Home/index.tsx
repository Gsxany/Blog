import React, { FC } from "react";
import styled from "@emotion/styled";
import { BlogList } from "./components/BlogList";
import { useDocumentTitle } from "utils/useCallback";
import { useStores } from "store";

export const Home: FC = () => {
  const { sApp } = useStores();
  useDocumentTitle(`博客🍓｜${sApp.siteTag}`);

  return (
    <HomeBox>
      <BlogList />
    </HomeBox>
  );
};

const HomeBox = styled.div`
  width: 80rem;
`;
