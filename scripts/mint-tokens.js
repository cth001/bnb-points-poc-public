const { ethers } = require("hardhat");

async function main() {
  // 获取合约实例
  const PointsToken = await ethers.getContractFactory("PointsToken");
  const pointsToken = PointsToken.attach(process.env.CONTRACT_ADDRESS);

  // 使用 .env 中的钱包信息
  const ownerAddress = process.env.WALLET_ADDRESS;
  const ownerPrivateKey = process.env.PRIVATE_KEY;

  console.log("开始铸造代币...");
  console.log("铸造者地址:", ownerAddress);

  // 创建钱包实例
  const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_URL);
  const wallet = new ethers.Wallet(ownerPrivateKey, provider);
  const tokenWithSigner = pointsToken.connect(wallet);

  // 铸造 1000 个代币
  const mintAmount = ethers.parseUnits("1000", 18);
  console.log("\n铸造数量:", ethers.formatUnits(mintAmount, 18), "BNBP");

  const tx = await tokenWithSigner.mint(ownerAddress, mintAmount);
  await tx.wait();
  console.log("铸造成功！交易哈希:", tx.hash);

  // 查询新余额
  const balance = await pointsToken.balanceOf(ownerAddress);
  console.log("\n当前钱包余额:", ethers.formatUnits(balance, 18), "BNBP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("铸造失败:", error);
    process.exit(1);
  });