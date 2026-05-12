import React, { useState } from 'react';
import { ExternalLink, Trash2, AlertTriangle, ChevronDown, ChevronRight, Cpu, Network, Database, Globe } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

const OrphanedResources = ({ resources: customResources }) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const TENANT_ID = '9cd6adc7-311b-4430-a9e1-42f8c0579762';
  
  const defaultResources = [
    { id: 1, name: 'disk-old-prod-01', type: 'microsoft.compute/disks', reason: 'Unattached', cost: '₹3,500/mo', sub: 'Production' },
    { id: 2, name: 'pip-unused-dev', type: 'microsoft.network/publicIPAddresses', reason: 'Unassociated', cost: '₹280/mo', sub: 'Development' },
    { id: 3, name: 'nic-vm-deleted-04', type: 'microsoft.network/networkinterfaces', reason: 'Unassociated', cost: '₹95/mo', sub: 'Production' },
    { id: 4, name: 'rg-empty-test-temp', type: 'microsoft.resources/resourcegroups', reason: 'No resources', cost: '₹0/mo', sub: 'Testing' },
    { id: 5, name: 'snapshot-backup-2023', type: 'microsoft.compute/snapshots', reason: 'Old (> 1 year)', cost: '₹980/mo', sub: 'Production' },
  ];

  const resources = customResources || defaultResources;

  // Group resources by Type
  const groupedResources = resources.reduce((acc, res) => {
    const rawType = res.type?.toLowerCase() || 'other';
    let displayType = 'Other Services';
    
    if (rawType.includes('compute/disks') || rawType.includes('compute/snapshots')) displayType = 'Compute Storage';
    else if (rawType.includes('network/publicipaddresses')) displayType = 'Networking IPs';
    else if (rawType.includes('network/networkinterfaces')) displayType = 'Network Interfaces';
    else if (rawType.includes('resources/resourcegroups')) displayType = 'Management Groups';
    
    if (!acc[displayType]) acc[displayType] = [];
    acc[displayType].push(res);
    return acc;
  }, {});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleExport = () => {
    const exportData = resources.map(r => ({
      Name: r.name,
      Type: r.type,
      Reason: r.reason,
      Cost: r.cost,
      Subscription: r.sub
    }));
    exportToCSV(exportData, 'orphaned-resources-report.csv');
  };

  const openPortal = (id) => {
    if (!id || typeof id !== 'string') return;
    const portalUrl = `https://portal.azure.com/#@${TENANT_ID}/resource${id}`;
    window.open(portalUrl, '_blank');
  };

  const getServiceIcon = (group) => {
    if (group.includes('Compute')) return <Cpu size={18} />;
    if (group.includes('Networking') || group.includes('Interfaces')) return <Network size={18} />;
    if (group.includes('Management')) return <Database size={18} />;
    return <Globe size={18} />;
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Service-wise Optimization
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'rgba(255, 77, 77, 0.1)', 
              color: 'var(--danger)', 
              padding: '2px 8px', 
              borderRadius: '100px',
              border: '1px solid rgba(255, 77, 77, 0.2)'
            }}>
              {resources.length} Items Found
            </span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Identified orphaned resources grouped by Azure service category.
          </p>
        </div>
        <button onClick={handleExport} className="glass-button" style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid var(--border-color)', 
          color: 'var(--text-primary)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(groupedResources).map(([groupName, groupResources]) => (
          <div key={groupName} className="resource-group-item" style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.01)'
          }}>
            <div 
              onClick={() => toggleGroup(groupName)}
              style={{ 
                padding: '16px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: expandedGroups[groupName] ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {expandedGroups[groupName] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'rgba(255, 77, 77, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--danger)'
                }}>
                  {getServiceIcon(groupName)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{groupName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {groupResources.length} {groupResources.length === 1 ? 'Asset' : 'Assets'} Detected
                  </span>
                </div>
              </div>
            </div>

            {expandedGroups[groupName] && (
              <div style={{ padding: '0 20px 20px 20px', background: 'rgba(255, 255, 255, 0.02)', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', marginTop: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 0' }}>Resource Name</th>
                      <th>Reason</th>
                      <th>Cost</th>
                      <th style={{ textAlign: 'right' }}>Portal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupResources.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ 
                          padding: '12px 0', 
                          fontSize: '0.875rem', 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }} title={item.name}>
                          {item.name}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--warning)', whiteSpace: 'nowrap' }}>{item.reason}</td>
                        <td style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{item.cost}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => openPortal(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrphanedResources;
