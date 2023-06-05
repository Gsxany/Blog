import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "antd/dist/antd.less";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./store";
import { PageLoading } from "components/PageLoading";

// 资源加载中的时候 加载 loading
const listen = () => {
  if (document.readyState === "complete") {
    // 资源加载完成
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("root")
    );
  } else {
    // 资源加载中
    ReactDOM.render(
      <React.StrictMode>
        <PageLoading />
      </React.StrictMode>,
      document.getElementById("root")
    );
  }
};

document.onreadystatechange = listen;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
