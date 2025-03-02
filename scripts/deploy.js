const hre = require("hardhat");

async function main() {
  console.log("开始部署合约...");
  
  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("使用账户地址:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");
  
  // 部署合约
  const PointsToken = await ethers.getContractFactory("PointsToken");
  console.log("编译合约成功，准备部署...");
  
  const pointsToken = await PointsToken.deploy();
  await pointsToken.waitForDeployment();
  
  const contractAddress = await pointsToken.getAddress();
  console.log("PointsToken 合约已部署到:", contractAddress);
  
  // 验证合约基本信息
  console.log("\n验证合约基本信息:");
  console.log("代币名称:", await pointsToken.name());
  console.log("代币符号:", await pointsToken.symbol());
  
  console.log("\n请将以下地址添加到 .env 文件中:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });