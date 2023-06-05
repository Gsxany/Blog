#!/bin/bash
WORK_PATH='/gsxany/code/web/server/'
cd $WORK_PATH
echo "清除老代码"
# 硬回退 - 清缓存
git reset --hard origin/main
git clean -f
echo "拉取最新代码"
git pull origin main
echo "下载npm资源包"
npm intsall
# --------------------------------------------------------
echo "停掉 然后 开启监听"
npm run sprd
npm run prd
# --------------------------------------------------------
# echo "开始执行构建"
# docker build -t blog-server:1.0 .
# echo "停止并删除旧容器"
# docker stop blog-server-container
# docker rm blog-server-container
# echo "启动新容器"
# # 端口映射 宿主机 - 映射到 - 容器的3333端口
# # -d 后台运行
# docker container run -p 3333:3333 --name blog-server-container -d blog-server:1.0