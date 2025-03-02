const express = require('express');
const { ethers } = require('hardhat');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 安全配置
app.use(helmet());
app.use(cors());
app.use(express.json());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100个请求
});
app.use(limiter);

// 合约初始化
let pointsToken;
async function initContract() {
  const [deployer] = await ethers.getSigners();
  const PointsToken = await ethers.getContractFactory("PointsToken");
  pointsToken = PointsToken.attach(process.env.CONTRACT_ADDRESS);
  console.log("合约初始化完成，地址:", process.env.CONTRACT_ADDRESS);
}

// 创建钱包 API
app.post('/api/wallet/create', async (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    res.json({
      success: true,
      data: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 发放积分 API
app.post('/api/points/mint', async (req, res) => {
  try {
    const { address, amount } = req.body;
    if (!address || !amount) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    const mintAmount = ethers.parseUnits(amount.toString(), 18);
    const tx = await pointsToken.mint(address, mintAmount);
    await tx.wait();

    res.json({
      success: true,
      data: {
        txHash: tx.hash,
        address,
        amount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 转账积分 API
app.post('/api/points/transfer', async (req, res) => {
  try {
    const { fromPrivateKey, toAddress, amount } = req.body;
    if (!fromPrivateKey || !toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    const provider = ethers.provider;
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const tokenWithSigner = pointsToken.connect(wallet);

    const transferAmount = ethers.parseUnits(amount.toString(), 18);
    const tx = await tokenWithSigner.transfer(toAddress, transferAmount);
    await tx.wait();

    res.json({
      success: true,
      data: {
        txHash: tx.hash,
        from: wallet.address,
        to: toAddress,
        amount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 查询积分余额 API
app.get('/api/points/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await pointsToken.balanceOf(address);
    
    res.json({
      success: true,
      data: {
        address,
        balance: ethers.formatUnits(balance, 18)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
initContract().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(console.error);