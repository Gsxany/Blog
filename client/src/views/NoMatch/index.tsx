import React, { FC } from "react";
import styled from "@emotion/styled";
import { useStores } from "store";
import { Link } from "react-router-dom";
import { FlexBlock } from "style/common";
import { useDocumentTitle } from "utils/useCallback";

export const NoMatch: FC = () => {
  const { sApp } = useStores();
  useDocumentTitle(`404！☕️｜${sApp.siteTag}`);
  sApp.CHANGE_ACTIVE_TAG("");
  sApp.CHANGE_HEADER_STYLE("blogDetail", {
    headerTitle: "404",
    headerDesc: "Not Found",
    headerImg: `#000`,
    headerTag: "",
    headerTagColor: "",
  });

  return (
    <NoMatchBox>
      <p>对应该页面暂未开发哈~</p>
      <p>
        如有疑问，请微信联系👇 &nbsp;&nbsp;
        <UserPs>ps: 可点击👇跳转扫码</UserPs>
      </p>
      <p>
        <LinkJump to="/qr-code">{sApp.siteTag}</LinkJump>
      </p>
    </NoMatchBox>
  );
};

const NoMatchBox = styled(FlexBlock)`
  color: #333;
  text-align: center;
  font-size: 1.8rem;
  min-height: 20rem;
  flex-direction: column;
  font-weight: bold;
  width: 80rem;
`;
const LinkJump = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`;
const UserPs = styled.span`
  font-size: 1.4rem;
  color: red;
`;
