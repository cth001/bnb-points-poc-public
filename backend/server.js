const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL,  Keypair, ComputeBudgetProgram } = require('@solana/web3.js');
const { Wallet, providers } = require('ethers');  // 更新 ethers 导入
const bs58 = require('bs58');  // 保持原样导入
const {createToken, mintToken, transferToken, getTokenBalance} = require('./solana-token');
// 导入必要的模块
const {Token, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const app = express();
const port = process.env.PORT || 3006; // 修改端口号为 3006

// 添加 Solana 网络配置
const SOLANA_NETWORK = 'devnet';
const connection = new Connection(`https://api.${SOLANA_NETWORK}.solana.com`);

// 中间件
app.use(cors());
app.use(bodyParser.json());

// BNB 转账接口 - 更新路径
app.post('/api/bnb/transfer', async (req, res) => {
  try {
    const { fromPrivateKey, toAddress, amount } = req.body;
    console.log('收到 BNB 转账请求:', { toAddress, amount });

    // 连接到 BNB 测试网
    const provider = new providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    
    // 创建钱包实例
    const wallet = new Wallet(fromPrivateKey, provider);
    
    // 构建交易
    const transaction = {
      to: toAddress,
      value: ethers.utils.parseEther(amount.toString())
    };

    // 发送交易
    const tx = await wallet.sendTransaction(transaction);
    console.log('交易已提交:', tx.hash);

    // 等待交易确认
    const receipt = await tx.wait();
    console.log('交易已确认:', receipt);
    
    res.json({
      success: true,
      data: {
        txHash: tx.hash,
        from: wallet.address,
        to: toAddress,
        amount: amount,
        blockNumber: receipt.blockNumber
      }
    });
  } catch (error) {
    console.error('BNB 转账错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加请求测试代币的函数
const requestAirdrop = async (publicKey) => {
  try {
    const signature = await connection.requestAirdrop(
      publicKey,
      2 * LAMPORTS_PER_SOL // 请求 2 SOL
    );
    await connection.confirmTransaction(signature);
    return true;
  } catch (error) {
    console.error('Airdrop 请求失败:', error);
    return false;
  }
};
// 创建代币
app.post('/api/solana/create-token', async (req, res) => {
  try {
    const { adminSecret } = req.body;
    const adminKeypair = Keypair.fromSecretKey(
      Buffer.from(adminSecret, 'base64')
    );
    
    const token = await createToken(adminKeypair);
    
    res.json({
      success: true,
      data: {
        tokenAddress: token.publicKey.toString //  .toString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// 铸造代币 API
app.post('/api/solana/mint-token', async (req, res) => {
  try {
    console.log('收到铸造代币请求:', req.body);
    const { tokenAddress, adminSecret, recipientAddress, amount } = req.body;
    
    if (!tokenAddress || !adminSecret || !recipientAddress || !amount) {
      throw new Error('缺少必要参数');
    }

    const adminKeypair = Keypair.fromSecretKey(
      Buffer.from(adminSecret, 'base64')
    );
    
    console.log('管理员公钥:', adminKeypair.publicKey.toString());
    
    const result = await mintToken(
      tokenAddress,
      adminKeypair,
      recipientAddress,
      Number(amount)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('铸造代币 API 错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 查询代币余额
app.get('/api/solana/token-balance', async (req, res) => {
  try {
    const { tokenAddress, walletAddress } = req.query;
    
    if (!tokenAddress || !walletAddress) {
      throw new Error('缺少必要参数：tokenAddress 或 walletAddress');
    }

    console.log('查询代币余额:', { tokenAddress, walletAddress });

    const mintPublicKey = new PublicKey(tokenAddress);
    const walletPublicKey = new PublicKey(walletAddress);

    // 创建一个管理员密钥对用于查询
    const adminKeypair = Keypair.fromSecretKey(
      Buffer.from('ROlcNRqKjhNJgwPtRpSXBZ2eB6UTf9fgSO00fxrOBj+A+TFNhgAjDB+aU23HbXyS8g8tj5elcaYP0oJFh0UJig==', 'base64')
    );

    // 获取关联代币账户
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mintPublicKey,
      walletPublicKey,
      true
    );

    // 获取代币余额
    const balance = await connection.getTokenAccountBalance(tokenAccount.address);
    
    res.json({
      success: true,
      data: {
        balance: balance.value.uiAmount,
        decimals: balance.value.decimals,
        tokenAddress,
        walletAddress,
        tokenAccount: tokenAccount.address.toString()
      }
    });
  } catch (error) {
    console.error('查询代币余额失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// 修改 Solana 转账接口
app.post('/api/solana/transfer', async (req, res) => {
  try {
    const { fromSecret, toAddress, amount } = req.body;
    console.log('收到 Solana 转账请求:', { toAddress, amount });
    
    // 从 Base64 私钥创建 Keypair
    const secretKey = Buffer.from(fromSecret, 'base64');
    const fromKeypair = Keypair.fromSecretKey(secretKey);
    
    // 检查余额
    const balance = await connection.getBalance(fromKeypair.publicKey);
    const requiredAmount = amount * LAMPORTS_PER_SOL;
    
    if (balance < requiredAmount) {
      // 如果余额不足，尝试请求空投
      console.log('余额不足，尝试请求空投...');
      const airdropSuccess = await requestAirdrop(fromKeypair.publicKey);
      if (!airdropSuccess) {
        throw new Error(`余额不足。当前余额: ${balance / LAMPORTS_PER_SOL} SOL, 需要: ${amount} SOL`);
      }
      // 等待余额更新
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    const toPublicKey = new PublicKey(toAddress);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: requiredAmount
      })
    );
    // 添加计算预算指令来设置较低的优先级和费用
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1  // 设置最低单位费用
      })
    );

    // 获取最新的 blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    // const { blockhash } = await connection.getLatestBlockhash();
    // transaction.recentBlockhash = blockhash;
    // transaction.feePayer = fromKeypair.publicKey;

    // 签名并发送交易
    // const signature = await connection.sendTransaction(transaction, [fromKeypair]);
    const signature = await connection.sendRawTransaction(await transaction.serialize(), {
      skipPreflight: false,  // 启用预检查以避免无效交易
      preflightCommitment: 'confirmed',
      maxRetries: 5
    });
    
    // 等待交易确认
    // const confirmation = await connection.confirmTransaction(signature);
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    
    console.log('Solana 交易已确认:', signature);
    
    res.json({
      success: true,
      data: {
        txHash: signature,
        from: '9gTaCu7oB2e1h8FJ9goWeeZ8GZ3NSyPH2BnYJMCH7fkd',
        to: toAddress,
        amount: amount,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}`
      }
    });
  } catch (error) {
    console.error('Solana 转账错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 查询 BNB 余额接口 - 更新路径
app.get('/api/bnb/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const contract = new ethers.Contract(POINTS_TOKEN_ADDRESS, POINTS_TOKEN_ABI, provider);
    
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    res.json({
      success: true,
      data: {
        balance: formattedBalance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加 Solana 余额查询接口
app.get('/api/solana/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    res.json({
      success: true,
      data: {
        balance: (balance / LAMPORTS_PER_SOL).toString()
      }
    });
  } catch (error) {
    console.error('查询 Solana 余额错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// BNB 创建钱包接口保持不变，因为已经有 bnb 前缀
app.post('/api/bnb/create-wallet', async (req, res) => {
  try {
    // 创建新的 BNB 钱包
    const wallet = Wallet.createRandom();
    
    console.log('创建的 BNB 钱包:', {
      address: wallet.address,
      privateKey: wallet.privateKey.slice(0, 10) + '...'  // 只打印部分私钥
    });
    
    res.json({
      success: true,
      data: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: '0'
      }
    });
  } catch (error) {
    console.error('创建 BNB 钱包错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '创建钱包失败'
    });
  }
});

// Solana 创建钱包接口保持不变
app.post('/api/solana/create-wallet', (req, res) => {
  try {
    // 生成新的 Solana 钱包
    const keypair = Keypair.generate();
    
    // 获取公钥和私钥
    const publicKey = keypair.publicKey.toString();
    const secretKey = Buffer.from(keypair.secretKey).toString('base64');  // 改用 base64 编码
    
    console.log('创建的 Solana 钱包:', {
      address: publicKey,
      secretKey: secretKey.slice(0, 10) + '...'  // 只打印部分私钥
    });

    res.json({
      success: true,
      data: {
        address: publicKey,
        secretKey: secretKey,
        balance: '0'
      }
    });
  } catch (error) {
    console.error('创建 Solana 钱包错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '创建钱包失败'
    });
  }
});

// 添加错误处理
const server = app.listen(port, () => {
  console.log(`后端服务器运行在 http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${port} 已被占用，请先关闭占用该端口的程序`);
  } else {
    console.log('服务器启动失败:', err.message);
  }
});

// 优雅退出
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});


const { ethers } = require('ethers');  // 更新导入方式

// 添加合约相关配置
const POINTS_TOKEN_ADDRESS = '0x7507f0772d066a3F8652F7Cb9B5EB01D558bcf9b';  // 需要替换为实际部署的合约地址
const POINTS_TOKEN_ABI = [
  "function mint(address to, uint256 amount)",
  "function transfer(address to, uint256 amount)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// BNB 转账接口更新为积分转账
app.post('/api/transfer', async (req, res) => {
  try {
    const { fromPrivateKey, toAddress, amount } = req.body;
    console.log('收到积分转账请求:', { toAddress, amount });

    // 连接到 BNB 测试网
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    
    // 创建钱包实例
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    
    // 创建合约实例
    const pointsContract = new ethers.Contract(POINTS_TOKEN_ADDRESS, POINTS_TOKEN_ABI, wallet);
    
    // 获取代币精度
    const decimals = await pointsContract.decimals();
    const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), decimals);

    // 发送积分转账交易
    const tx = await pointsContract.transfer(toAddress, amountWithDecimals);
    console.log('交易已提交:', tx.hash);

    // 等待交易确认
    const receipt = await tx.wait();
    console.log('交易已确认:', receipt);
    
    res.json({
      success: true,
      data: {
        txHash: tx.hash,
        from: wallet.address,
        to: toAddress,
        amount: amount,
        blockNumber: receipt.blockNumber,
        tokenAddress: POINTS_TOKEN_ADDRESS
      }
    });
  } catch (error) {
    console.error('积分转账错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加积分铸造接口
app.post('/api/mint', async (req, res) => {
  try {
    const { adminPrivateKey, toAddress, amount } = req.body;
    console.log('收到积分铸造请求:', { toAddress, amount });

    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const wallet = new ethers.Wallet(adminPrivateKey, provider);
    const pointsContract = new ethers.Contract(POINTS_TOKEN_ADDRESS, POINTS_TOKEN_ABI, wallet);
    
    const decimals = await pointsContract.decimals();
    const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), decimals);

    const tx = await pointsContract.mint(toAddress, amountWithDecimals);
    console.log('铸造交易已提交:', tx.hash);

    const receipt = await tx.wait();
    console.log('铸造交易已确认:', receipt);
    
    res.json({
      success: true,
      data: {
        txHash: tx.hash,
        to: toAddress,
        amount: amount,
        blockNumber: receipt.blockNumber
      }
    });
  } catch (error) {
    console.error('积分铸造错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 添加积分余额查询接口
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const pointsContract = new ethers.Contract(POINTS_TOKEN_ADDRESS, POINTS_TOKEN_ABI, provider);
    
    const balance = await pointsContract.balanceOf(address);
    const decimals = await pointsContract.decimals();
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    res.json({
      success: true,
      data: {
        balance: formattedBalance
      }
    });
  } catch (error) {
    console.error('查询余额错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
