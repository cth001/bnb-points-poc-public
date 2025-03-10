export default function TransactionList({ transactions }) {
    const columns = [
        {
            title: '交易哈希',
            dataIndex: 'hash',
            key: 'hash',
            render: (hash) => <a href={hash.startsWith('0x') 
                ? `https://testnet.bscscan.com/tx/${hash}`
                : `https://explorer.solana.com/tx/${hash}?cluster=devnet`} 
                target="_blank" rel="noopener noreferrer">
                {hash.slice(0, 10)}...
            </a>
        },
        // ... 其他列保持不变 ...
    ];

    return (
        <Table 
            dataSource={transactions} 
            columns={columns} 
            rowKey="hash"
            pagination={{ pageSize: 5 }}
        />
    );
}