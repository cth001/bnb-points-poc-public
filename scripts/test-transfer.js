const { ethers } = require("hardhat");

async function main() {
  // 获取命令行参数
  const [,, fromAddress, fromPrivateKey, toAddress, amount] = process.argv;

  if (!fromAddress || !fromPrivateKey || !toAddress || !amount) {
    console.error("使用方法: npx hardhat run scripts/test-transfer.js --network bscTestnet <发送方地址> <发送方私钥> <接收方地址> <转账数量>");
    process.exit(1);
  }

  // 获取合约实例
  const PointsToken = await ethers.getContractFactory("PointsToken");
  const pointsToken = PointsToken.attach(process.env.CONTRACT_ADDRESS);

  console.log("开始交易测试...");
  console.log("发送方地址:", fromAddress);
  console.log("接收方地址:", toAddress);
  console.log("转账数量:", amount, "BNBP");

  // 查询初始余额
  const initialBalance = await pointsToken.balanceOf(fromAddress);
  console.log("\n初始余额:", ethers.formatUnits(initialBalance, 18), "BNBP");

  // 确保余额充足后再转账
  const transferAmount = ethers.parseUnits(amount.toString(), 18);
  if (initialBalance < transferAmount) {
    throw new Error(`余额不足，当前余额: ${ethers.formatUnits(initialBalance, 18)} BNBP，需要: ${amount} BNBP`);
  }

  // 创建钱包实例并执行转账
  const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_URL);
  const wallet = new ethers.Wallet(fromPrivateKey, provider);
  const tokenWithSigner = pointsToken.connect(wallet);

  console.log("\n执行转账...");
  const transferTx = await tokenWithSigner.transfer(toAddress, transferAmount);
  await transferTx.wait();
  console.log("转账成功！交易哈希:", transferTx.hash);

  // 查询转账后的余额
  const fromBalance = await pointsToken.balanceOf(fromAddress);
  const toBalance = await pointsToken.balanceOf(toAddress);

  console.log("\n交易完成！");
  console.log("发送方余额:", ethers.formatUnits(fromBalance, 18), "BNBP");
  console.log("接收方余额:", ethers.formatUnits(toBalance, 18), "BNBP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("交易失败:", error);
    process.exit(1);
  });