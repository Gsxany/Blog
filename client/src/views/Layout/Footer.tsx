import React, { FC } from "react";
import styled from "@emotion/styled";
import { FlexBlock, UserNoSelect } from "style/common";
import { useStores } from "store";

export const Footer: FC = () => {
  const { sApp } = useStores();
  return (
    <FooterBox>
      <UserNoSelect>
        Copyright © {sApp.siteTag} {new Date().getFullYear()} | Powered by Hux
        Theme
      </UserNoSelect>
      <div>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
          京ICP备2022007965号
        </a>
      </div>
    </FooterBox>
  );
};

const FooterBox = styled(FlexBlock)`
  width: 100%;
  height: 3rem;
  padding-bottom: 5rem;
  font-size: 1.4rem;
  color: #666;
  flex-direction: column;
  line-height: 26px;
`;
