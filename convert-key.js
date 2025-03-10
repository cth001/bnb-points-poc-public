const fs = require('fs');

// 读取密钥文件
const keyData = fs.readFileSync('solana-keypair.json');
const keyArray = JSON.parse(keyData);

// 转换为 Base64
const base64Key = Buffer.from(keyArray).toString('base64');
console.log('Base64 密钥:', base64Key);