import React from 'react';
import { LayoutDashboard, Box, CreditCard, ShieldAlert, Settings, LogOut, Cloud } from 'lucide-react';
import { useMsal } from "@azure/msal-react";

const Sidebar = ({ activeView, setActiveView }) => {
  const { instance } = useMsal();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview' },
    { icon: Box, label: 'Resources' },
    { icon: CreditCard, label: 'Cost Management' },
    { icon: ShieldAlert, label: 'Optimization' },
    { icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => console.error(e));
  };

  return (
    <div className="sidebar glass-card" style={{
      width: 'var(--sidebar-width)',
      height: 'calc(100vh - 40px)',
      margin: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'sticky',
      top: '20px',
      zIndex: 100
    }}>
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }} 
        />
        <h2 className="sidebar-logo-text" style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Azure Insights</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = activeView === item.label;
          return (
            <div
              key={index}
              className="sidebar-item"
              onClick={() => setActiveView(item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '4px',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="sidebar-label" style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div 
        className="sidebar-footer"
        onClick={handleLogout}
        style={{ 
          marginTop: 'auto',
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}
      >
        <LogOut size={20} />
        <span className="sidebar-label">Sign Out</span>
      </div>
    </div>
  );
};

export default Sidebar;
