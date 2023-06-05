import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { message } from "antd";

export interface IResponse {
  data: any;
  msg: string;
}

const currentUrl = window.location.host;
let baseURL;
/**
 * 目前只有 开发环境 / 生产环境
 * 代理环境在 nginx 配置~
 *  - 也可以根据 process.env.NODE_ENV 区分 开发/生产 环境
 */
if (/localhost:*/.test(currentUrl)) {
  baseURL = process.env.REACT_APP_DEV_BASE_URL;
} else {
  baseURL = process.env.REACT_APP_PROD_BASE_URL;
}
let service: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
  /**
   * `transformRequest` 允许在向服务器发送前，修改请求数据
   * 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
   * 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
   */
});

/**
 * 请求拦截
 */
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: any) => {
    console.error(error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    // 如果有出错~ Promise.reject 抛出错误~
    return res;
  },
  (error: any) => {
    console.log(`err${error}`); // for debug
    message.error({
      content: error.message,
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default service;
