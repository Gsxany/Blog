import React, { FC, useEffect, useState } from "react";
import Editor from "for-editor";
import { Form, Input, Switch, Select, Button, message } from "antd";
import "./edit-md-form.css";
import styled from "@emotion/styled";
import { UngroupOutlined } from "@ant-design/icons";
import { getBlogDetail, postBlogCreate, putBlogUpdate } from "apis/blog";
import { getTagList } from "apis/tag";
import { ITagItem } from "utils/dataMap";
import { useNavigate, useParams } from "react-router";
import { useDocumentTitle } from "utils/useCallback";
import { useStores } from "store";
const { Option } = Select;

export const EditMd: FC = () => {
  const { sApp } = useStores();
  useDocumentTitle(`博客编辑✍️｜${sApp.siteTag}`);
  const { blogID = "" } = useParams();
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const [tagList, setTagList] = useState<ITagItem[]>([]);
  const [blogDetail, setBlogDetail] = useState({
    title: "",
    desc: "",
    isTop: false,
    tagID: "",
    body: "",
  });

  const handleEditorChange = (body: string): void => {
    setBlogDetail({
      ...blogDetail,
      body,
    });
  };
  const onFinish = async (values: any) => {
    const _request = {
      id: blogID,
      ...values,
      body: blogDetail.body,
    };
    try {
      if (blogID) {
        await putBlogUpdate(_request);
      } else {
        await postBlogCreate(_request);
      }
      message.success("博客[创建/更新]成功~");
      navigate("/home");
    } catch (error) {
      message.warning(`Failed: ${error}`);
    }
  };
  const fetchTagList = async () => {
    const { list } = (await getTagList()) as any;
    setTagList(list);
  };
  const fetchBlogDetail = async () => {
    const _request = {
      id: blogID,
    };
    const { data } = (await getBlogDetail(_request)) as any;
    setBlogDetail({
      ...blogDetail,
      ...data,
    });
    formRef.setFieldsValue(data);
  };

  useEffect(() => {
    fetchTagList();
  }, []);
  useEffect(() => {
    if (blogID) {
      fetchBlogDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogID]);

  const onFinishFailed = (errorInfo: any) => {
    message.warning(`Failed: ${errorInfo}`);
  };

  const handleChange = () => {};

  return (
    <div className="mark__editor--box">
      <Form
        name="basic"
        initialValues={blogDetail}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={formRef}
      >
        <ButtonBox>
          <Button
            icon={<UngroupOutlined />}
            type="primary"
            shape="round"
            htmlType="submit"
            onClick={() => onFinish}
          >
            发布
          </Button>
        </ButtonBox>

        <Form.Item
          label="标题"
          name="title"
          style={{ paddingTop: "6.5rem" }}
          rules={[{ required: true, message: "请输入该博客标题" }]}
        >
          <Input placeholder="请输入该博客的标题" />
        </Form.Item>

        <Form.Item
          label="描述"
          name="desc"
          rules={[{ required: true, message: "请输入该博客的相关描述" }]}
        >
          <Input.TextArea rows={3} placeholder="请输入该博客的相关描述" />
        </Form.Item>

        <Form.Item
          label="是否置顶"
          name="isTop"
          rules={[{ required: true, message: "请选择" }]}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="标签"
          name="tagID"
          rules={[{ required: true, message: "请选择该博客对应的标签" }]}
        >
          <Select
            style={{ width: 120 }}
            placeholder="请选择"
            onChange={handleChange}
          >
            {tagList.map((_tag) => (
              <Option key={_tag._id} value={_tag._id}>
                {_tag.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <EditorBox>
          <Editor value={blogDetail.body} onChange={handleEditorChange} />
        </EditorBox>
      </Form>
    </div>
  );
};

const ButtonBox = styled.div`
  width: 100vw;
  position: fixed;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 333;
  height: 5rem;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 3rem;
`;
const EditorBox = styled.div`
  width: 100vw;
  padding: 0 3rem 3rem;
  .for-container {
    width: 100%;
  }
`;
