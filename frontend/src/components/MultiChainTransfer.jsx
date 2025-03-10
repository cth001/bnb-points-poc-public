import React, { useState, useEffect } from 'react';
import {Box, Grid, Paper, Typography, TextField, Button, Snackbar, Alert} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3006/api'; // 更新端口号

import TransactionHistory from './TransactionHistory';
import ApiStatus from './ApiStatus';

const MultiChainTransfer = () => {
  // 添加状态管理
  const [transactions, setTransactions] = useState([]);
  const [apiResponse, setApiResponse] = useState('Waiting for transaction...');
  // const [apiResponse, setApiResponse] = useState('等待交易...');
  const [activeChain, setActiveChain] = useState('bnb');
  // const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('10');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  // 添加交易记录的函数
  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev].slice(0, 10)); // 只保留最近10条记录
  };
  // 处理交易函数
  // 添加余额刷新函数
  const refreshBalance = async (chain, address) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${chain}/balance/${address}`);
      if (response.data.success) {
        if (chain === 'bnb') {
          setBnbWallet(prev => ({
            ...prev,
            balance: response.data.data.balance
          }));
        } else {
          setSolanaWallet(prev => ({
            ...prev,
            balance: response.data.data.balance
          }));
        }
      }
    } catch (error) {
      console.error('Refesh Balance error:', error);
      showNotification(`Refesh Balance error: ${error.message}`, 'error');
    }
  };
  // 在交易成功后自动刷新余额
  const handleTransfer = async () => {
      // 根据当前选择的链获取正确的接收地址
    const currentRecipient = activeChain === 'bnb' ? bnbRecipient : solanaRecipient;

    if (!currentRecipient) {
      showNotification('Please enter recipient address', 'error');
      // showNotification('请输入接收方地址', 'error');
      return;
    }

    setApiResponse('Initializing transaction...');
    // setApiResponse('正在初始化交易...');
  
    try {
      setApiResponse('Submitting Transaction to the Blockchain...');
      let response;
      
      if (activeChain === 'bnb') {
        setApiResponse('Calling BNB Chain API...');
        // setApiResponse('正在调用 BNB Chain API...');
        response = await axios.post(`${API_BASE_URL}/transfer`, {
          fromPrivateKey: '0x985546d37ccd9a1fe0ab7931d34ce6b1497fc775593c5e5ccece79e097be6fe1',
          toAddress: currentRecipient,
          amount: Number(amount)
        });
      } else {
        setApiResponse('Calling Solana API...');
        // setApiResponse('正在调用 Solana API...');
        response = await axios.post(`${API_BASE_URL}/solana/mint-token`, {
          tokenAddress: 'EVpcyhP2wHNfgTzyWyqKuQf9SWR8XUYziB3SSq1sUsvp',  // 固定的代币地址
          adminSecret: 'ROlcNRqKjhNJgwPtRpSXBZ2eB6UTf9fgSO00fxrOBj+A+TFNhgAjDB+aU23HbXyS8g8tj5elcaYP0oJFh0UJig==',  // 固定的管理员密钥
          recipientAddress: currentRecipient,
          amount: amount.toString()
        });
      }
  
      console.log('API Response:', response.data);
  
      if (response.data.success) {
        const txData = response.data.data;
        addTransaction({
          chain: activeChain,
          status: 'success',
          message: activeChain === 'bnb' 
            ? `Successfully transfer ${amount} BNB Points to address ${currentRecipient}`
            : `Successfully transfer ${amount} SPT Points to address ${currentRecipient}`,
          hash: activeChain === 'bnb' ? txData.txHash : txData.signature,
          explorer: activeChain === 'bnb' 
            ? `https://testnet.bscscan.com/tx/${txData.txHash}`
            : `https://explorer.solana.com/tx/${txData.signature}?cluster=devnet`
        });
        
        setApiResponse(JSON.stringify({
          status: 'success',
          chain: activeChain.toUpperCase(),
          operation: activeChain === 'bnb' ? 'Transfer' : 'Transfer',
          transactionHash: activeChain === 'bnb' ? txData.txHash : txData.signature,
          tokenAccount: txData.tokenAccount,
          from: activeChain === 'bnb' ? txData.from : 'Contract',
          to: currentRecipient,
          amount: `${amount} ${activeChain === 'bnb' ? 'BNB Points' : 'SPT'}`,
          explorer: activeChain === 'bnb'
            ? `https://testnet.bscscan.com/tx/${txData.txHash}`
            : `https://explorer.solana.com/tx/${txData.signature}?cluster=devnet`,
          tokenAccountExplorer: activeChain === 'solana'
            ? `https://explorer.solana.com/address/${txData.tokenAccount}?cluster=devnet`
            : undefined,
          timestamp: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        }, null, 2));
        
        showNotification(
          `${activeChain === 'bnb' ? 'BNB Points Transfer' : 'Solana Token Mint'} Successful!`, 
          'success'
          // `${activeChain === 'bnb' ? 'BNB Points 转账' : 'Solana 代币铸造'}成功！`, 
          // 'success'
        );
      }
    } catch (error) {
      console.error('Transaction Error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      
      addTransaction({
        chain: activeChain,
        status: 'error',
        message: `Transaction faild: ${errorMessage}`
      });
      
      setApiResponse(JSON.stringify({
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      showNotification(`Transaction faild: ${errorMessage}`, 'error');
    }
    // 交易成功后刷新余额
    if (activeChain === 'bnb' && bnbWallet) {
      await refreshBalance('bnb', bnbWallet.address);
    } else if (solanaWallet) {
      await refreshBalance('solana', solanaWallet.address);
    }
  };
  // 显示通知的函数
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };
  
  // 添加钱包状态
  const [bnbWallet, setBnbWallet] = useState(null);
  const [solanaWallet, setSolanaWallet] = useState(null);
  // 修改接收方地址输入框，为每个链维护独立的状态
  const [bnbRecipient, setBnbRecipient] = useState('');
  const [solanaRecipient, setSolanaRecipient] = useState('');
  
  // 创建钱包函数
  const createWallet = async (chain) => {
    try {
      setApiResponse(`Creating ${chain.toUpperCase()} Wallet...`);
      const response = await axios.post(`${API_BASE_URL}/${chain}/create-wallet`);
      
      if (response.data.success) {
        const walletData = response.data.data;
        if (chain === 'bnb') {
          setBnbWallet(walletData);
        } else {
          setSolanaWallet(walletData);
        }
        showNotification(`${chain.toUpperCase()} Create Wallet Success！`, 'success');
        setApiResponse(JSON.stringify({
          status: 'success',
          wallet: {
            address: walletData.address,
            balance: walletData.balance
          },
          timestamp: new Date().toISOString()
        }, null, 2));
      }
    } catch (error) {
      console.error(`${chain} Create Wallet faild:`, error);
      showNotification(`Create Wallet faild: ${error.message}`, 'error');
      setApiResponse(JSON.stringify({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  };
  // 修改 BNB 钱包显示部分
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a1b25', fontWeight: 'bold' }}>
        Current Chain Selection: {activeChain.toUpperCase()}
      </Typography>
      <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: '#1a1b25',
              color: 'white',
              border: '2px solid #F3BA2F',
              borderRadius: '16px'
            }}
            onClick={() => setActiveChain('bnb')}  // 添加点击事件
          >
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => createWallet('bnb')}
                sx={{
                  bgcolor: '#F3BA2F',
                  color: '#1a1b25',
                  '&:hover': { bgcolor: '#d4a41c' },
                  mb: 2,
                  width: '100%'  // 添加全宽按钮
                }}
              >
                Create BNB Wallet
              </Button>
              {bnbWallet && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 1,
                  wordBreak: 'break-all',
                  border: '1px solid rgba(243,186,47,0.3)'  // 添加边框
                }}>
                  <Typography variant="body2" sx={{ color: '#F3BA2F', mb: 1 }}>
                  Wallet Address:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {bnbWallet.address}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#F3BA2F', mt: 1, mb: 1 }}>
                    Balance:
                  </Typography>
                  <Typography variant="body2">
                    {bnbWallet.balance} BNB Points
                  </Typography>
                </Box>
              )}
            </Box>
            {/* BNB 交易表单 */}
            <Box>
              <TextField
                fullWidth
                label="Recipient Address"
                value={activeChain === 'bnb' ? bnbRecipient : ''}
                onChange={(e) => activeChain === 'bnb' 
                  ? setBnbRecipient(e.target.value) 
                  : setBnbRecipient('') 
                }
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(243,186,47,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#F3BA2F',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F3BA2F',
                  }
                }}
                InputProps={{
                  sx: { color: 'white' }
                }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(243,186,47,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#F3BA2F',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F3BA2F',
                  }
                }}
                InputProps={{
                  sx: { color: 'white' }
                }}
              />
              <Button 
                fullWidth 
                variant="contained"
                onClick={handleTransfer}
                sx={{ 
                  bgcolor: '#F3BA2F',
                  color: '#1a1b25',
                  '&:hover': { bgcolor: '#d4a41c' }
                }}
              >
                Send BNB Points
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Solana 交易面板 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: '#1a1b25',
              color: 'white',
              border: '2px solid #9945FF',
              borderRadius: '16px'
            }}
            onClick={() => setActiveChain('solana')}  // 添加点击切换
          >
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => createWallet('solana')}
                sx={{
                  bgcolor: '#9945FF',
                  '&:hover': { bgcolor: '#7d38d1' },
                  mb: 2,
                  width: '100%'
                }}
              >
                Create Solana Wallet
              </Button>
              {solanaWallet && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 1,
                  wordBreak: 'break-all'
                }}>
                  <Typography variant="body2" sx={{ color: '#a0a3c4', mb: 1 }}>
                  Wallet Address:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {solanaWallet.address}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#a0a3c4', mt: 1, mb: 1 }}>
                  Balance:
                  </Typography>
                  <Typography variant="body2">
                    {solanaWallet.balance} SPT Points
                  </Typography>
                </Box>
              )}
            </Box>
            {/* 添加 Solana 交易表单 */}
            <Box>
              <TextField
                fullWidth
                label="Recipient Address"
                value={activeChain === 'bnb' ? '' : solanaRecipient}
                onChange={(e) => activeChain === 'bnb' 
                  ? setSolanaRecipient('')
                  : setSolanaRecipient(e.target.value)
                }
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(153,69,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9945FF',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#9945FF',
                  }
                }}
                InputProps={{
                  sx: { color: 'white' }
                }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(153,69,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9945FF',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#9945FF',
                  }
                }}
                InputProps={{
                  sx: { color: 'white' }
                }}
              />
              <Button 
                fullWidth 
                variant="contained"
                onClick={handleTransfer}
                sx={{ 
                  bgcolor: '#9945FF',
                  '&:hover': { bgcolor: '#7d38d1' }
                }}
              >
                Send SPT Transaction
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 交易历史和 API 状态 */}
        <Grid item xs={12} md={6}>
          <TransactionHistory transactions={transactions} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ApiStatus 
            response={apiResponse}
            lastUpdated={new Date().toLocaleString()}
          />
        </Grid>
      </Grid>
      
      {/* Snackbar 保持不变 */}
    </Box>
  );
};

export default MultiChainTransfer;  // 确保正确导出
