import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav className="side-menu">
        <div className="menu-item">Dashboard</div>
        <div className="menu-item">Points Issue</div>
        <div className="menu-item">User Management</div>
        <div className="menu-item">Redemption Records</div>
        <div className="menu-item">Statistics</div>
        <div className="menu-item">Settings</div>
      </nav>

      <div className="main-content">
        <header className="top-nav">
          <h2>Points Management System</h2>
          <div className="user-info">
            <span>Admin</span>
            <img src="/avatar.png" alt="avatar" width="32" style={{ borderRadius: '50%', marginLeft: '12px' }} />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

export default Layout;