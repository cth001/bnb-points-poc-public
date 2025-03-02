const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("使用账户:", deployer.address);

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("请在 .env 文件中设置 CONTRACT_ADDRESS");
  }

  const PointsToken = await ethers.getContractFactory("PointsToken");
  const pointsToken = PointsToken.attach(contractAddress);

  // 创建测试钱包
  const testWallet = ethers.Wallet.createRandom();
  console.log("\n创建测试钱包:");
  console.log("地址:", testWallet.address);
  console.log("私钥:", testWallet.privateKey);

  // 铸造积分
  console.log("\n开始铸造积分...");
  const mintAmount = ethers.parseUnits("100", 18); // 铸造 100 个积分
  const tx = await pointsToken.mint(testWallet.address, mintAmount);
  await tx.wait();
  
  // 查询余额
  const balance = await pointsToken.balanceOf(testWallet.address);
  console.log("铸造成功！");
  console.log("钱包余额:", ethers.formatUnits(balance, 18), "BNBP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });