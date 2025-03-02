const { ethers } = require("ethers");

function generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    console.log("钱包地址:", wallet.address);
    console.log("私钥:", wallet.privateKey.slice(2)); // 移除 "0x" 前缀
    console.log("\n请将这个私钥保存到 .env 文件中的 PRIVATE_KEY 变量中");
    console.log("警告：请妥善保管私钥，永远不要分享给他人！");
}

generateWallet();