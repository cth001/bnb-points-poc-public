import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const Dashboard = () => {
  useEffect(() => {
    // 初始化图表
    const trendChart = echarts.init(document.getElementById('trendChart'));
    const pieChart = echarts.init(document.getElementById('pieChart'));

    // 设置图表配置
    trendChart.setOption({
      title: { text: 'Points Trend Analysis' },
      xAxis: { data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
      yAxis: {},
      series: [
        { name: 'Issued', type: 'line', data: [120, 200, 150, 80, 70, 110, 130] },
        { name: 'Redeemed', type: 'line', data: [80, 150, 100, 60, 50, 90, 100] }
      ]
    });

    pieChart.setOption({
      title: { text: 'Points Status Distribution' },
      series: [{
        type: 'pie',
        data: [
          { value: 896532, name: 'Unclaimed' },
          { value: 234567, name: 'Claimed' },
          { value: 123456, name: 'Redeemed' }
        ]
      }]
    });

    // 清理函数
    return () => {
      trendChart.dispose();
      pieChart.dispose();
    };
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="data-card">
          <h3>Total Points Issued</h3>
          <p style={{ fontSize: '24px', color: 'var(--primary-color)' }}>1,234,567</p>
        </div>
        <div className="data-card">
          <h3>Points in Circulation</h3>
          <p style={{ fontSize: '24px', color: 'var(--success-color)' }}>896,532</p>
        </div>
        <div className="data-card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '24px', color: 'var(--warning-color)' }}>8,962</p>
        </div>
        <div className="data-card">
          <h3>Daily Redemption</h3>
          <p style={{ fontSize: '24px', color: '#666' }}>2,345</p>
        </div>
      </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
    <div className="data-card">
      <h3>BNB Chain</h3>
      <p style={{ fontSize: '24px', color: '#F0B90B' }}>{Math.floor(Math.random() * 800000)}</p>
    </div>
    <div className="data-card">
      <h3>Solana</h3>
      <p style={{ fontSize: '24px', color: '#00FFA3' }}>{Math.floor(Math.random() * 800000)}</p>
    </div>
    <div className="data-card">
      <h3>R2</h3>
      <p style={{ fontSize: '24px', color: '#1E88E5' }}>{Math.floor(Math.random() * 800000)}</p>
    </div>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="data-card" id="trendChart" style={{ height: '400px' }}></div>
        <div className="data-card" id="pieChart" style={{ height: '400px' }}></div>
      </div>
  <div className="data-card" style={{ textAlign: 'center' }}>
    <button className="action-button">Issue Points</button>
    <button className="action-button" style={{ marginLeft: '12px' }}>Batch Redeem</button>
    <button className="action-button" style={{ marginLeft: '12px' }}>Export Data</button>
  </div>
</div>
);
};

export default Dashboard;