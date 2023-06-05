import request from "./request";

/**
 * @description 获取 博客列表
 * @author guolin
 * @url /blog/list
 * @method get
 */
export function getBlogList(params = {}) {
  return request({
    url: "/blog/list",
    method: "get",
    params,
  });
}

/**
 * @description 获取 博客详情
 * @author guolin
 * @url /blog/detail
 * @method get
 */
export function getBlogDetail(params = {}) {
  return request({
    url: "/blog/detail",
    method: "get",
    params,
  });
}

/**
 * @description 创建博客
 * @author guolin
 * @url /blog/create
 * @method post
 */
export function postBlogCreate(data = {}) {
  return request({
    url: "/blog/create",
    method: "post",
    data,
  });
}

/**
 * @description 编辑博客
 * @author guolin
 * @url /blog/create
 * @method put
 */
export function putBlogUpdate(data = {}) {
  return request({
    url: "/blog/update",
    method: "put",
    data,
  });
}
