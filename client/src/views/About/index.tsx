import React, { FC, useEffect } from "react";
import styled from "@emotion/styled";
import { useStores } from "store";
import { useDocumentTitle } from "utils/useCallback";
import { Link } from "react-router-dom";

export const About: FC = () => {
  const { sApp } = useStores();
  // const diffTime = {
  //   years: new Date().getFullYear() - 2019 - 1,
  //   months: new Date().getMonth() + 1 > 7,
  // };
  // {diffTime.months ? diffTime.years + 1 : diffTime.years}
  useDocumentTitle(`关于我✨｜${sApp.siteTag}`);

  useEffect(() => {
    sApp.CHANGE_LOADING(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AboutBox>
      <AboutItem>
        <Title>关于博主</Title>
        <Body className="text">
          <p>郭霖，2019年毕业，前端研发工程师。</p>
          <p>目前就职于 新浪微博广告部门。</p>
          <p>
            -- 负责「 微博广告特征管理平台
            <TextTag>( Vite + Vue3 + TS )</TextTag> 」从 0 到 1 的搭建及部署。
          </p>
          <p>
            -- 负责「 微博App博文推广<TextTag>( Vue )</TextTag>
            、广告博文创意生成<TextTag>( Vue3 + TS )</TextTag>{" "}
            」等界面构建工作。
          </p>
          <p>
            -- 主导「 广告部门网站构建
            <TextTag>( Vite + Vue3 + TS )</TextTag>以及组内 Wiki 搭建
            <TextTag>( docker )</TextTag> 」。
          </p>
          <p>
            <b>目前擅长：（从熟练程度依次递减~）</b>
          </p>
          <p>
            --
            <TextTag>
              HTML、JS、CSS、Vue、( TS｜Node｜React｜小程序 )、(
              Vite｜Webpack｜Gulp｜MongoDB )
            </TextTag>
          </p>
        </Body>
      </AboutItem>

      <AboutItem>
        <Title>关于博客</Title>
        <Body className="ul--style">
          <ul>
            <li>
              博客定位：专注于<TextTag>Web前端</TextTag>
              相关基础、技术原理、性能优化、实战案例的技术类文章。
            </li>
          </ul>
        </Body>
      </AboutItem>

      <AboutItem>
        <Title>联系博主</Title>
        <Body className="ul--style">
          <ul>
            <li>
              微博：
              <AJump href="https://weibo.com/u/7842190617" target="_blank">
                微博
              </AJump>
            </li>
            <li>
              微信账号：
              <LinkJump to="/qr-code/wx" target="_blank">
                {sApp.siteTag}
              </LinkJump>
            </li>
            <li>
              电子邮箱：<TextTag>{sApp.siteTag}@163.com</TextTag>
            </li>
          </ul>
        </Body>
      </AboutItem>

      <AboutItem>
        <Title>博客历史</Title>
        <Body className="ul--style">
          <ul>
            <li>
              <p>2023.07.17，搭建个人博客并更新第一条博客。ଘ(੭ˊᵕˋ)੭ </p>
              <p>
                「<TextTag>React + Ts</TextTag>」- PC端、 「
                <TextTag>Vue + VitePress</TextTag>」- 移动端、 「
                <TextTag>MongoDB + Koa</TextTag>」 - Server端。
              </p>
            </li>
            <li>
              <p>2023.07.21，博客导航栏新增文章检索功能。づ♡ど </p>
            </li>
          </ul>
        </Body>
      </AboutItem>
    </AboutBox>
  );
};

const AboutBox = styled.div`
  width: 80rem;
`;
const AboutItem = styled.div`
  padding: 0rem 2rem 1rem;
  color: #000;
  font-size: 1.6rem;
`;
const Title = styled.div`
  font-size: 1.8rem;
  color: #666;
  font-weight: bold;
`;
const Body = styled.div`
  padding: 0.5rem 1rem 1rem 2rem;
  line-height: 3rem;
  &.text {
    text-indent: 2rem;
  }
  &.ul--style {
    padding-left: 0;
  }
  p {
    line-height: 2rem;
  }
`;
const TextTag = styled.span`
  color: #f50;
  margin: 0 0.3rem;
`;
const AJump = styled.a`
  color: #337ab7;
  &:hover {
    text-decoration: underline;
  }
`;
const LinkJump = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`;
