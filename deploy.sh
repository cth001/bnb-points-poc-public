#!/bin/bash

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 创建项目目录
mkdir -p /home/ubuntu/bnb-points
cd /home/ubuntu/bnb-points

# 安装 PM2
sudo npm install -g pm2

# 安装项目依赖
npm install

# 启动后端服务
cd backend
pm2 start server.js --name "bnb-points-backend"

# 启动前端服务
cd ../frontend
pm2 start server.js --name "bnb-points-frontend"

# 保存 PM2 进程
pm2 save

# 设置开机自启
pm2 startup