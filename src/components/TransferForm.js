// ... 现有导入保持不变 ...

export default function TransferForm() {
    // ... 现有状态保持不变 ...
    const [isSolana, setIsSolana] = useState(false);  // 添加 Solana 模式切换
    
    // 添加 Solana 转账处理函数
    const handleSolanaTransfer = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3005/api/solana/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fromSecret: fromPrivateKey,
                    toAddress: toAddress,
                    amount: parseFloat(amount)
                })
            });
            
            const result = await response.json();
            if (result.success) {
                setTransactions(prev => [...prev, {
                    hash: result.data.txHash,
                    from: result.data.fromBalance,
                    to: result.data.toBalance,
                    amount: amount,
                    timestamp: new Date().toISOString()
                }]);
                message.success('转账成功！');
            } else {
                message.error(`转账失败: ${result.error}`);
            }
        } catch (error) {
            message.error(`转账失败: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSolana) {
            await handleSolanaTransfer();
        } else {
            await handleTransfer();  // 原有的转账函数
        }
    };

    return (
        <div className="transfer-form">
            <Form onSubmit={handleSubmit}>
                {/* ... 现有表单元素 ... */}
                <Form.Item>
                    <Switch
                        checkedChildren="Solana"
                        unCheckedChildren="BSC"
                        checked={isSolana}
                        onChange={setIsSolana}
                    />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {isSolana ? 'Solana 转账' : 'BSC 转账'}
                </Button>
            </Form>
            {/* ... 其他组件 ... */}
        </div>
    );
}