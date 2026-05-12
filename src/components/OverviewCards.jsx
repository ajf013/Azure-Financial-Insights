import React from 'react';
import { TrendingUp, Box, AlertCircle, DollarSign } from 'lucide-react';

const OverviewCards = ({ stats: customStats }) => {
  const defaultStats = [
    { 
      label: 'Monthly Cost', 
      value: '₹1,84,500', 
      change: '+12%', 
      icon: DollarSign, 
      color: 'var(--accent-blue)',
      description: 'Projected: ₹2,10,000'
    },
    { 
      label: 'Active Resources', 
      value: '142', 
      change: '-3', 
      icon: Box, 
      color: 'var(--accent-purple)',
      description: 'Across 12 subscriptions'
    },
    { 
      label: 'Orphaned Resources', 
      value: '29', 
      change: 'Action Required', 
      icon: AlertCircle, 
      color: 'var(--danger)',
      description: 'Potential savings: ₹24,320/mo'
    },
    { 
      label: 'Cost Efficiency', 
      value: '84%', 
      change: '+5%', 
      icon: TrendingUp, 
      color: 'var(--success)',
      description: 'Above organization average'
    }
  ];

  const stats = customStats || defaultStats;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '20px',
      marginBottom: '32px'
    }}>
      {stats.map((stat, index) => (
        <div key={index} className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ 
              background: `rgba(${stat.color === 'var(--danger)' ? '255, 77, 77' : stat.color === 'var(--success)' ? '0, 255, 136' : '0, 242, 255'}, 0.1)`,
              padding: '10px',
              borderRadius: '12px',
              color: stat.color,
              display: 'flex'
            }}>
              <stat.icon size={24} />
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: stat.change && stat.change.includes('+') ? 'var(--danger)' : stat.change && stat.change.includes('-') ? 'var(--success)' : stat.color,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {stat.change}
            </span>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>
              {stat.label}
            </h4>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
