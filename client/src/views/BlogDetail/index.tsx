import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Anchor } from "antd";
import MarkNav from "markdown-navbar";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "markdown-navbar/dist/navbar.css";
import { getBlogDetail } from "apis/blog";
import { IBlogItem } from "utils/dataMap";
import { useStores } from "store";
import { useDocumentTitle } from "utils/useCallback";

export const BlogDetail: FC = () => {
  const { id = "" } = useParams();
  const [detail, setDetail] = useState<IBlogItem | null>(null);
  const { sApp } = useStores();
  useDocumentTitle(`博客详情👀｜${sApp.siteTag}`);

  useEffect(() => {
    sApp.CHANGE_LOADING(true);
    const _request = { id };
    const getDetail: () => void = async () => {
      const { data } = (await getBlogDetail(_request)) as any;
      setDetail(data);
      await sApp.CHANGE_ACTIVE_TAG("");
      await sApp.CHANGE_HEADER_STYLE("blogDetail", {
        headerTitle: data.title,
        headerDesc: "",
        headerImg: `#333`,
        headerTag: data?.tagInfo?.name,
        headerTagColor: data?.tagInfo?.color,
        headerTagFontColor: data?.tagInfo?.fontColor,
      });
      await sApp.CHANGE_LOADING(false);
    };
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * https://github.com/remarkjs/react-markdown#node-types
   * markdown_style
   * atomDark a11yDark materialDark nord okaidia
   * pojoaque tomorrow xonokai
   */
  return (
    <BlogDetailBox>
      <MdBox>
        <ReactMarkdown
          children={detail?.body || ""}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, "")}
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </MdBox>
      <Anchor style={{ float: "right" }}>
        <BlogDetailNav
          className="article-menu"
          source={detail?.body || ""}
          headingTopOffset={80}
        />
      </Anchor>
    </BlogDetailBox>
  );
};

const BlogDetailBox = styled.div`
  width: 100rem;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
`;
const MdBox = styled.div`
  width: 85rem;
  code {
    color: #f50;
    background-color: #fff5f5;
    padding: 0.3rem 0.6rem;
    border-radius: 0.3rem;
    border: 1px solid #eee;
    box-sizing: border-box;
  }
  pre code {
    background-color: transparent;
    border: 0px solid transparent;
    padding: 0;
    border-radius: 0;
  }
  blockquote {
    position: relative;
    padding-left: 1.3rem;
    color: #888;
    &::before {
      position: absolute;
      left: 0;
      top: 0;
      background-color: #eee;
      content: " ";
      width: 0.5rem;
      border-radius: 1rem;
      height: 100%;
    }
  }
  img {
    max-width: 85rem;
  }
  table {
    width: 95%;
  }
  th,
  td {
    text-align: center;
    border: 0.1px solid #dedede;
    padding: 1rem;
  }
`;
const BlogDetailNav = styled(MarkNav)`
  width: 25rem;

  .title-anchor {
    font-weight: normal;
    &.active {
      color: #42b983 !important;
      background-color: #ebedef;
    }
  }
  .title-anchor.title-level1 {
    color: #000;
    font-weight: 900;
  }
  .title-anchor.title-level2 {
    color: #222;
    font-weight: 800;
  }
  .title-anchor.title-level3 {
    color: #333;
    font-weight: 700;
  }
  .title-anchor.title-level4 {
    color: #555;
    font-weight: 600;
  }
  .title-anchor.title-level5 {
    color: #888;
    font-weight: 500;
  }
`;
