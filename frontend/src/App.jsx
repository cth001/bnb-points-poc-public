import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, Paper, Snackbar } from '@mui/material';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import './styles.css';

// 确保这个地址与后端服务器地址匹配
const API_BASE_URL = 'http://localhost:3000/api';

function App() {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const createWallet = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallet/create`);
      setWallet(response.data.data);
      showNotification('钱包创建成功！');
    } catch (error) {
      showNotification('创建钱包失败：' + error.message);
    }
  };

  const mintPoints = async () => {
    if (!wallet || !amount) return;
    try {
      await axios.post(`${API_BASE_URL}/points/mint`, {
        address: wallet.address,
        amount: amount
      });
      showNotification(`成功铸造 ${amount} 积分`);
      setAmount('');
    } catch (error) {
      showNotification('铸造失败：' + error.message);
    }
  };

  const transferPoints = async () => {
    if (!wallet || !amount || !toAddress) return;
    try {
      await axios.post(`${API_BASE_URL}/points/transfer`, {
        fromPrivateKey: wallet.privateKey,
        toAddress: toAddress,
        amount: amount
      });
      showNotification(`成功转账 ${amount} 积分到 ${toAddress}`);
      setAmount('');
      setToAddress('');
    } catch (error) {
      showNotification('转账失败：' + error.message);
    }
  };

  const checkBalance = async () => {
    if (!wallet) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/points/balance/${wallet.address}`);
      showNotification(`当前余额：${response.data.data.balance} BNBP`);
    } catch (error) {
      showNotification('查询余额失败：' + error.message);
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setShowMessage(true);
  };
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

export default App;