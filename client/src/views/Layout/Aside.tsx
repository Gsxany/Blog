import React, { FC, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Tag } from "antd";
import { getTagList } from "apis/tag";
import { ITagItem } from "utils/dataMap";
import { useNavigate } from "react-router";

export const Aside: FC = () => {
  const navigate = useNavigate();
  const [tagList, setTagList] = useState<ITagItem[]>([]);

  useEffect(() => {
    const getData: () => void = async () => {
      const _request = {
        isShowAll: true,
      };
      const { list: tagList = [] } = (await getTagList(_request)) as any;
      setTagList(tagList);
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onIntoTagClassify: (id: string) => void = (id) => {
    navigate(`/catalogue/${id}`);
  };

  return (
    <AsideBox>
      <AsideTitle>标签</AsideTitle>
      <TagBox>
        {tagList.map((_tag) => (
          <TagItem
            onClick={() => onIntoTagClassify(_tag._id)}
            key={_tag._id}
            color={_tag.color}
          >
            <span style={{ color: _tag.fontColor }}>{_tag.name}</span>
          </TagItem>
        ))}
      </TagBox>
    </AsideBox>
  );
};

const AsideBox = styled.div`
  width: 20rem;
  min-height: 35rem;
`;
const AsideTitle = styled.h5`
  font-size: 1.6rem;
  color: #666;
`;
const TagBox = styled.div``;
const TagItem = styled(Tag)`
  margin: 0.5rem;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
    box-shadow: 1px 1px 2px 1px #bbb;
  }
`;
