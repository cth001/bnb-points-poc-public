const { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram,  // 添加这个导入
  sendAndConfirmTransaction
} = require('@solana/web3.js');
const { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMintToInstruction
} = require('@solana/spl-token');
const NETWORK = 'devnet';
const connection = new Connection(`https://api.${NETWORK}.solana.com`);

// 修改 createToken 函数
async function createToken(adminKeypair) {
  try {
    console.log('开始创建代币...');
    
    // 检查当前余额
    const balance = await connection.getBalance(adminKeypair.publicKey);
    console.log('当前钱包余额:', balance / 1000000000, 'SOL');

    // 如果余额小于 0.1 SOL，提示用户访问水龙头
    if (balance < 100000000) {
      throw new Error(
        '钱包余额不足，且已达到自动请求限制。请访问 https://faucet.solana.com 手动获取测试 SOL，' +
        '或等待24小时后再试。当前余额: ' + (balance / 100000000) + ' SOL'
      );
    }
    
    // 初始化 Mint
    const mintPubkey = await spl.createMint(
      connection,
      adminKeypair,
      adminKeypair.publicKey,
      adminKeypair.publicKey,
      9  // decimals
    );

    console.log('代币创建成功:', mintPubkey.toBase58());
    return mintPubkey;
  } catch (error) {
    console.error('创建代币时出错:', error);
    throw error;
  }
}

// 铸造代币
async function mintToken(mintAddress, adminKeypair, recipientAddress, amount) {
  try {
    console.log('开始铸造代币...');
    console.log('参数信息:', {
      mintAddress,
      adminPublicKey: adminKeypair.publicKey.toString(),
      recipientAddress,
      amount
    });

    const mintPublicKey = new PublicKey(mintAddress);
    const recipientPublicKey = new PublicKey(recipientAddress);
    
    // 首先获取代币账户
    console.log('获取代币账户...');
    let associatedTokenAddress;
    try {
      associatedTokenAddress = await getOrCreateAssociatedTokenAccount(
        connection,
        adminKeypair,        // 支付账户创建费用
        mintPublicKey,       // 代币 mint
        recipientPublicKey,  // 代币账户所有者
        true                 // 允许所有者账户不存在
      );
      console.log('代币账户创建/获取成功:', associatedTokenAddress.address.toString());
    } catch (error) {
      console.error('创建代币账户时出错:', error);
      throw error;
    }
    // const associatedTokenAddress = await spl.getAssociatedTokenAddress(
    //   mintPublicKey,
    //   recipientPublicKey
    // );
    console.log('关联代币账户地址:', associatedTokenAddress.address.toString());

    // // 首先检查代币账户是否存在
    // console.log('检查代币账户...');
    // let tokenAccount;
    // try {
    //   console.log('尝试创建关联代币账户...');
    //   tokenAccount = await createAssociatedTokenAccount(
    //     connection,
    //     adminKeypair,
    //     mintPublicKey,
    //     recipientPublicKey
    //   );
    //   console.log('关联代币账户创建成功:', tokenAccount.toString());
    // } catch (e) {
    //   if (e.message.includes('already in use')) {
    //     console.log('代币账户已存在，获取现有账户...');
    //     tokenAccount = await getOrCreateAssociatedTokenAccount(
    //       connection,
    //       adminKeypair,
    //       mintPublicKey,
    //       recipientPublicKey
    //     );
    //     console.log('获取现有代币账户成功:', tokenAccount.address.toString());
    //   } else {
    //     throw e;
    //   }
    // }

    console.log('开始铸造操作...');
    // const signature = await mintTo(
    //   connection,
    //   adminKeypair,
    //   mintPublicKey,
    //   tokenAccount.address || tokenAccount,
    //   adminKeypair,
    //   amount * Math.pow(10, 9)
    // );
    const mintTx = new Transaction().add(
        createMintToInstruction(
          mintPublicKey,           // mint
          associatedTokenAddress.address,  // 目标账户
          adminKeypair.publicKey,  // mint authority
          amount * Math.pow(10, 9) // amount
        )
    );
    const signature = await sendAndConfirmTransaction(
        connection,
        mintTx,
        [adminKeypair]
    );

    console.log('铸造完成，交易签名:', signature);
    // await connection.confirmTransaction(signature);
    // console.log('交易已确认');

    return {
        signature,
        tokenAccount: associatedTokenAddress.toString(),
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    };
  } catch (error) {
    console.error('铸造代币时出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}
async function transferToken(token, fromKeypair, toAddress, amount) {
  try {
    const toPublicKey = new PublicKey(toAddress);
    
    // 获取发送者的代币账户
    const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(
      fromKeypair.publicKey
    );
    
    // 获取接收者的代币账户
    const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(
      toPublicKey
    );

    // 执行转账
    await token.transfer(
      fromTokenAccount.address,
      toTokenAccount.address,
      fromKeypair.publicKey,
      [],
      amount * Math.pow(10, SOLANA_POINT_TOKEN.decimals)
    );

    return true;
  } catch (error) {
    console.error('Error transferring token:', error);
    throw error;
  }
}

// 查询代币余额
async function getTokenBalance(mintAddress, walletAddress) {
  try {
    console.log('查询代币余额...');
    console.log('参数信息:', { mintAddress, walletAddress });

    const mintPublicKey = new PublicKey(mintAddress);
    const walletPublicKey = new PublicKey(walletAddress);
    
    // 获取代币账户
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mintPublicKey,
      walletPublicKey
    );

    // 获取余额
    const balance = await connection.getTokenAccountBalance(tokenAccount.address);
    console.log('查询余额成功:', balance.value.uiAmount);
    
    return balance.value.uiAmount;
  } catch (error) {
    console.error('查询代币余额时出错:', error);
    throw error;
  }
}

module.exports = {
  createToken,
  mintToken,
  transferToken,
  getTokenBalance
};