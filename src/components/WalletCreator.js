import React, { useState } from 'react';
import { Button, message, Card, Typography } from 'antd';
const { Text } = Typography;

export default function WalletCreator() {
    const [wallet, setWallet] = useState(null);

    const createWallet = async () => {
        try {
            const response = await fetch('http://localhost:3005/api/solana/create-wallet', {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) {
                setWallet(result.data);
                message.success('钱包创建成功！');
            }
        } catch (error) {
            message.error('创建钱包失败：' + error.message);
        }
    };

    return (
        <Card title="Solana 测试钱包">
            <Button onClick={createWallet}>创建新钱包</Button>
            {wallet && (
                <div style={{ marginTop: 16 }}>
                    <p><Text strong>公钥：</Text> {wallet.publicKey}</p>
                    <p><Text strong>私钥：</Text> {wallet.secretKey}</p>
                </div>
            )}
        </Card>
    );
}