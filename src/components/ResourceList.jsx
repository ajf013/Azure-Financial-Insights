import React, { useState } from 'react';
import { Box, MapPin, Layers, ExternalLink, ChevronDown, ChevronRight, Folder } from 'lucide-react';

const ResourceList = ({ resources, loading }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  if (loading) return null; // Parent handles loading spinner

  if (!resources || resources.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <Box size={48} style={{ marginBottom: '16px', color: 'var(--text-secondary)' }} />
        <h3>No Resources Found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any resources in your subscriptions.</p>
      </div>
    );
  }

  // Group resources by resourceGroup
  const groupedResources = resources.reduce((acc, res) => {
    const group = res.resourceGroup || 'Default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(res);
    return acc;
  }, {});

  const TENANT_ID = '9cd6adc7-311b-4430-a9e1-42f8c0579762';

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const openPortal = (id) => {
    if (!id || typeof id !== 'string') return;
    const portalUrl = `https://portal.azure.com/#@${TENANT_ID}/resource${id}`;
    window.open(portalUrl, '_blank');
  };

  return (
    <div className="glass-card fade-in" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Resource Groups</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing {Object.keys(groupedResources).length} resource groups across all subscriptions.
        </p>
      </div>

      <div className="groups-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                background: expandedGroups[groupName] ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {expandedGroups[groupName] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'rgba(168, 85, 247, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--accent-purple)'
                }}>
                  <Folder size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{groupName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {groupResources.length} {groupResources.length === 1 ? 'Resource' : 'Resources'}
                  </span>
                </div>
              </div>
            </div>

            {expandedGroups[groupName] && (
              <div style={{ 
                padding: '0 20px 20px 20px', 
                background: 'rgba(255, 255, 255, 0.03)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div className="table-container" style={{ marginTop: '16px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <th style={{ padding: '8px 0' }}>Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupResources.map((res, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ 
                            padding: '12px 0', 
                            fontWeight: 500,
                            maxWidth: '250px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={res.name}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Box size={14} color="var(--accent-blue)" />
                              {res.name}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {res.type?.split('/').pop()}
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} />
                              {res.location}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => openPortal(res.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                              <ExternalLink size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
