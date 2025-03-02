const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// 模拟数据存储
const wallets = new Map();
const transactions = new Map();
let transactionCount = 0;

// 创建测试钱包 API
app.post('/api/test/wallet/create', async (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    const walletData = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      balance: "100.0" // 初始测试余额
    };
    wallets.set(wallet.address, walletData);

    res.json({
      success: true,
      data: walletData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 模拟转账 API
app.post('/api/test/transfer', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;
    
    if (!fromAddress || !toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // 检查发送方钱包
    const fromWallet = wallets.get(fromAddress);
    if (!fromWallet) {
      return res.status(404).json({
        success: false,
        error: 'Sender wallet not found'
      });
    }

    // 检查余额
    if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // 更新余额
    fromWallet.balance = (parseFloat(fromWallet.balance) - parseFloat(amount)).toString();
    
    // 如果接收方钱包不存在，创建一个
    let toWallet = wallets.get(toAddress);
    if (!toWallet) {
      toWallet = {
        address: toAddress,
        balance: "0"
      };
      wallets.set(toAddress, toWallet);
    }
    toWallet.balance = (parseFloat(toWallet.balance) + parseFloat(amount)).toString();

    // 记录交易
    const txHash = `0x${(++transactionCount).toString(16).padStart(64, '0')}`;
    const transaction = {
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      amount: amount,
      timestamp: new Date().toISOString()
    };
    transactions.set(txHash, transaction);

    res.json({
      success: true,
      data: {
        transaction,
        fromBalance: fromWallet.balance,
        toBalance: toWallet.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 查询余额 API
app.get('/api/test/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const wallet = wallets.get(address);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    res.json({
      success: true,
      data: {
        address,
        balance: wallet.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// 初始化合约
const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_URL);
const contractABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// 确保合约地址存在
if (!process.env.CONTRACT_ADDRESS) {
  console.error('错误: 环境变量中缺少 CONTRACT_ADDRESS');
  process.exit(1);
}

console.log('正在连接合约:', process.env.CONTRACT_ADDRESS);
console.log('使用 RPC URL:', process.env.BSC_TESTNET_URL);

const pointsToken = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
);

// 验证合约连接
pointsToken.name().then(name => {
  console.log('合约连接成功');
  console.log('代币名称:', name);
}).catch(error => {
  console.error('合约连接失败:', error);
  process.exit(1);
});

// 真实转账 API
app.post('/api/transfer', async (req, res) => {
    try {
        const { fromPrivateKey, toAddress, amount } = req.body;
    
        if (!fromPrivateKey || !toAddress || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters 缺少必要参数'
            });
        }
    
        // 创建钱包实例
        const wallet = new ethers.Wallet(fromPrivateKey, provider);
        const fromAddress = wallet.address;
        const tokenWithSigner = pointsToken.connect(wallet);
    
        // 查询余额
        const balance = await pointsToken.balanceOf(fromAddress);
        const transferAmount = ethers.parseUnits(amount.toString(), 18);
    
        if (balance < transferAmount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance 余额不足: ${ethers.formatUnits(balance, 18)} BNBP`
            });
        }
    
        // 执行转账
        const tx = await tokenWithSigner.transfer(toAddress, transferAmount);
        await tx.wait();
    
        // 查询新余额
        const newFromBalance = await pointsToken.balanceOf(fromAddress);
        const newToBalance = await pointsToken.balanceOf(toAddress);
    
        res.json({
          success: true,
          data: {
            txHash: tx.hash,
            from: fromAddress,
            to: toAddress,
            amount: amount,
            fromBalance: ethers.formatUnits(newFromBalance, 18),
            toBalance: ethers.formatUnits(newToBalance, 18)
          }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Transaction failed 交易失败: ${error.message}`
        });
    }
});
const PORT = process.env.PORT || 3001;  // 改用 3000 端口
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});