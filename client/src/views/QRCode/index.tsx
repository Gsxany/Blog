import React, { FC, useState } from "react";
import styled from "@emotion/styled";
import { FlexBlock } from "style/common";

export const QRCode: FC = () => {
  const [thirdParty] = useState({
    name: "微信",
    qrUrl: "https://img.gsxany.com/wx.png",
    width: "38rem",
  });

  return (
    <QRCodeBox>
      <QRCodeMain>
        <h3>
          请使用<TextTag>{thirdParty.name}</TextTag>扫描下方👇二维码
        </h3>
        <QRCodeImg
          src={thirdParty.qrUrl}
          alt="二维码"
          width={thirdParty.width}
        />
      </QRCodeMain>
    </QRCodeBox>
  );
};

const QRCodeBox = styled(FlexBlock)`
  width: 100vw;
  height: 100vh;
  background-color: #333;
`;
const QRCodeMain = styled(FlexBlock)`
  flex-direction: column;
  h3 {
    color: #fff;
    margin-bottom: 2rem;
    font-size: 1.8rem;
  }
`;
const QRCodeImg = styled.img<{
  width?: string;
}>`
  width: ${({ width }) => (width ? width : "30rem")};
`;
const TextTag = styled.span`
  color: #f50;
  margin: 0 0.3rem;
  font-size: 2.2rem;
`;
