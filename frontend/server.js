const express = require('express');
const path = require('path');
const app = express();

// 添加日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 主页路由
app.get('/', (req, res) => {
    console.log('提供页面:', path.join(__dirname, 'public', 'testAPI.html'));
    res.sendFile(path.join(__dirname, 'public', 'testAPI.html'));
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器错误');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`前端服务器运行在端口 ${PORT}`);
    console.log(`根目录: ${__dirname}`);
});