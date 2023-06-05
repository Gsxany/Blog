import styled from "@emotion/styled";

export const FlexBlock = styled.div<{
  alignItems?: string;
  justifyCentent?: string;
}>`
  display: flex;
  align-items: ${(props) => (props.alignItems ? props.alignItems : "center")};
  justify-content: ${(props) =>
    props.justifyCentent ? props.justifyCentent : "center"};
`;

export const UserNoSelect = styled.div`
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
`;
