import React, { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { Divider, Empty, Tag } from "antd";
import { getBlogList } from "apis/blog";
import { IBlogItem, ITagItem } from "utils/dataMap";
import dayjs from "dayjs";
import { FireOutlined } from "@ant-design/icons";
import { useStores } from "store";
import { Pager } from "components/Pager";
import EventBus from "utils/eventBus";

export const BlogList: FC = () => {
  const navigate = useNavigate();
  const routes = useLocation();
  const { search = "" } = routes;
  const searchVal =
    search
      ?.replace("?", "")
      ?.split("&")
      ?.find((_item) => /search/.test(_item))
      ?.split("=")[1] || "";

  const [blogList, setBlogList] = useState<IBlogItem[]>([]);
  const [itemActive, setItemActive] = useState(-1);
  const [pagerParams, setPagerParams] = useState({
    pageSize: 30,
    pageNo: 1,
    total: 0,
  });
  const { sApp } = useStores();
  if (searchVal) {
    sApp.CHANGE_SEARCH_VAL(decodeURI(searchVal));
  } else {
    sApp.CHANGE_SEARCH_VAL("");
  }
  const getData: (isInit?: boolean, search?: string) => void = async (
    isInit = false,
    search = ""
  ) => {
    if (isInit || search.trim()) sApp.CHANGE_LOADING(true);
    const _request = {
      search: search.trim() || "",
      pageSize: pagerParams.pageSize,
      pageNo: pagerParams.pageNo,
    };
    const { list = [], total = 0 } = (await getBlogList(_request)) as any;
    setBlogList(list);
    setPagerParams({ ...pagerParams, total });
    sApp.CHANGE_LOADING(false);
  };

  useEffect(() => {
    if (!search) getData(true);
    EventBus.off("fetchBlogList");
    EventBus.on("fetchBlogList", (search: string) => {
      setPagerParams({ ...pagerParams, pageNo: 1 });
      getData(false, search);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnterItem: (index: number) => void = (index: number) => {
    setItemActive(index);
  };
  const handleLeaveItem = () => {
    setItemActive(-1);
  };
  const intoBlogDetail: (_blog: IBlogItem) => void = (_blog) => {
    navigate(`/blog-detail/${_blog._id}`);
  };
  const pageJump: (direction: string) => void = (direction) => {
    const dispatchDir: {
      [prop: string]: () => void;
    } = {
      prev: () =>
        setPagerParams({ ...pagerParams, pageNo: pagerParams.pageNo - 1 }),
      next: () =>
        setPagerParams({ ...pagerParams, pageNo: pagerParams.pageNo + 1 }),
    };
    dispatchDir[direction]();
  };

  useEffect(() => {
    getData(false, sApp.searchVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagerParams.pageNo]);

  return (
    <BlogBox>
      {pagerParams.total ? (
        blogList.map((_blog, index) => (
          <div key={_blog._id}>
            <BlogItem
              onMouseEnter={() => handleEnterItem(index)}
              onMouseLeave={handleLeaveItem}
              onClick={() => intoBlogDetail(_blog)}
            >
              <ItemTitle actived={itemActive === index}>
                {_blog.isTop ? (
                  <ItemIsTop>
                    [Top
                    <FireOutlined style={{ fontSize: "1.6rem" }} />]
                  </ItemIsTop>
                ) : null}
                {_blog.title}
              </ItemTitle>

              <ItemDesc actived={itemActive === index}>{_blog.desc}</ItemDesc>

              <ItemBottom>
                <ItemTime actived={itemActive === index}>
                  Posted by {sApp.siteTag} on&nbsp;
                  {dayjs(_blog.updateDate).format("YYYY/MM/DD")}
                </ItemTime>
                <ItemTag>
                  {Object.keys(_blog.tagInfo as ITagItem).length ? (
                    <Tag color={(_blog.tagInfo as ITagItem).color}>
                      <span
                        style={{ color: (_blog.tagInfo as ITagItem).fontColor }}
                      >
                        {(_blog.tagInfo as ITagItem).name}
                      </span>
                    </Tag>
                  ) : null}
                </ItemTag>
              </ItemBottom>
            </BlogItem>
            {index === blogList.length - 1 ? null : <Divider />}
          </div>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
      )}

      <Pager pagerParams={pagerParams} pageJump={pageJump} />
    </BlogBox>
  );
};

const BlogBox = styled.div`
  width: 100%;
  padding: 0rem 1rem;
`;
const BlogItem = styled.div`
  flex-direction: column;
  line-height: 2rem;
  cursor: pointer;
`;
const ItemIsTop = styled.span`
  color: red;
`;
const ItemTitle = styled.h2<{
  actived?: boolean;
}>`
  font-weight: bold;
  font-size: 2.2rem;
  color: ${({ actived = false }) => (actived ? "#42b983" : "#000")};
`;
const ItemDesc = styled.p<{
  actived?: boolean;
}>`
  text-indent: 3.2rem;
  color: ${({ actived = false }) => (actived ? "#000" : "#999")};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
`;
const ItemBottom = styled.div`
  position: relative;
`;
const ItemTime = styled.span<{
  actived?: boolean;
}>`
  margin-top: 1rem;
  color: ${({ actived = false }) => (actived ? "#000" : "#888")};
`;
const ItemTag = styled.span`
  position: absolute;
  right: 1.5rem;
`;
