import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import OverviewCards from './components/OverviewCards';
import CostChart from './components/CostChart';
import OrphanedResources from './components/OrphanedResources';
import ResourceList from './components/ResourceList';
import { Search, Bell, User, LogIn, ShieldCheck, DollarSign, Box, AlertCircle, TrendingUp, Loader2, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { fetchResourceInventory, fetchOrphanedResources, fetchSubscriptions, fetchActualCost, fetchBudgets, fetchResourceCosts, createBudget, fetchUserProfilePhoto } from "./services/azureService";
import Footer from "./components/Footer/Footer";

function App() {
  const { instance, accounts } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const hasLoaded = useRef(false);
  const [activeView, setActiveView] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [azureData, setAzureData] = useState({
    resources: null,
    orphans: null,
    subscriptions: null,
    actualCost: 0,
    resourceCosts: {},
    budgetAmount: 0,
    isBudgetMock: false,
    userPhoto: null,
    loading: false,
    error: null
  });

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error(e);
      setAzureData(prev => ({ ...prev, error: `Login failed: ${e.message}` }));
    });
  };

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response && response.account) {
          instance.setActiveAccount(response.account);
        }
      } catch (e) {
        console.error("Redirect Error:", e);
      }
    };
    handleRedirect();
  }, [instance]);

  useEffect(() => {
    const account = activeAccount || accounts[0];
    if (account && !hasLoaded.current && !azureData.loading) {
      loadAzureData(account);
      hasLoaded.current = true;
    }
  }, [activeAccount, accounts]);

  const loadAzureData = async (account) => {
    setAzureData(prev => ({ ...prev, loading: true, error: null }));
    try {
      // 1. Get Management API Token
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
        scopes: ["https://management.azure.com/user_impersonation"]
      });

      // 2. Get Graph API Token for Profile Photo
      let userPhoto = null;
      try {
        const graphResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account: account,
          scopes: ["User.Read"]
        });
        userPhoto = await fetchUserProfilePhoto(graphResponse.accessToken);
      } catch (graphErr) {
        console.warn("Failed to get Graph token/photo:", graphErr);
      }
      
      const [resources, orphans, subs] = await Promise.all([
        fetchResourceInventory(response.accessToken),
        fetchOrphanedResources(response.accessToken),
        fetchSubscriptions(response.accessToken)
      ]);

      const subId = subs.value?.[0]?.subscriptionId;
      let actualCost = 0;
      let budgetAmount = 0;
      let isBudgetMock = true;
      let resourceCosts = {};
      if (subId) {
        try {
          const [cost, budgets, rCosts] = await Promise.all([
            fetchActualCost(response.accessToken, subId),
            fetchBudgets(response.accessToken, subId),
            fetchResourceCosts(response.accessToken, subId)
          ]);
          actualCost = cost;
          resourceCosts = rCosts;
          if (budgets && Array.isArray(budgets) && budgets.length > 0) {
            const realBudget = budgets.find(b => b.name === 'MonthlyDashboardBudget') || budgets[0];
            budgetAmount = realBudget.properties?.amount || 12450;
            isBudgetMock = false;
          } else {
            budgetAmount = 12450; // $150 credit fallback
            isBudgetMock = true;
          }
        } catch (costErr) {
          console.error("Failed to fetch cost/budget data:", costErr);
        }
      }

      setAzureData({
        resources: Array.isArray(resources) ? resources : resources.value || [],
        orphans: Array.isArray(orphans) ? orphans : orphans.value || [],
        subscriptions: subs.value || [],
        actualCost: actualCost,
        resourceCosts: resourceCosts,
        budgetAmount: budgetAmount,
        isBudgetMock: isBudgetMock,
        userPhoto: userPhoto,
        loading: false,
        error: null
      });
    } catch (e) {
      console.error("loadAzureData error details:", e);
      setAzureData(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Failed to fetch live data: ${e.message || e.toString()}. Please verify your Azure permissions (Reader role).` 
      }));
    }
  };

  const handleCreateBudget = async () => {
    const account = activeAccount || accounts[0];
    const subId = azureData.subscriptions?.[0]?.subscriptionId;
    if (!subId || !account) return;

    try {
      setAzureData(prev => ({ ...prev, loading: true }));
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });
      
      const amount = 12450; // $150 credit
      const emails = ['anto13franc@outlook.com', 'sasafiyullah@outlook.com'];
      
      await createBudget(response.accessToken, subId, amount, emails);
      
      // Refresh data
      loadAzureData(account);
      alert(`Budget 'MonthlyDashboardBudget' created successfully on Subscription ID: ${subId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create budget: " + e.message);
      setAzureData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSyncPhoto = async () => {
    const account = activeAccount || accounts[0];
    if (!account) return;
    
    try {
      const response = await instance.acquireTokenPopup({
        ...loginRequest,
        scopes: ["User.Read"]
      });
      const photo = await fetchUserProfilePhoto(response.accessToken);
      setAzureData(prev => ({ ...prev, userPhoto: photo }));
    } catch (e) {
      console.error("Sync failed:", e);
    }
  };

  const renderContent = () => {
    if (azureData.loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-blue)" />
        </div>
      );
    }

    if (activeView === 'Overview') {
      return (
        <div className="fade-in">
          {azureData.isBudgetMock && (
            <div className="glass-card fade-in" style={{ 
              background: 'rgba(0, 242, 255, 0.05)', 
              border: '1px solid var(--accent-blue)', 
              padding: '20px', 
              borderRadius: '16px', 
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--accent-blue)' }}>No Azure Budget Detected</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                  Would you like to initialize a monthly budget of <strong>₹12,450 ($150)</strong> with alerts for your team?
                </p>
              </div>
              <button 
                onClick={handleCreateBudget}
                style={{ 
                  background: 'var(--accent-blue)', 
                  color: 'black', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  cursor: 'pointer' 
                }}
              >
                Create Budget
              </button>
            </div>
          )}

          <OverviewCards stats={azureData.resources ? [
            { label: 'Actual Cost (MTD)', value: formatINR(azureData.actualCost || 0), change: 'Live', icon: DollarSign, color: 'var(--accent-blue)', description: 'Actual spend from Azure API' },
            { label: 'Active Resources', value: azureData.resources.length.toString(), change: 'Live', icon: Box, color: 'var(--accent-purple)', description: 'Across all subscriptions' },
            { label: 'Orphaned Assets', value: azureData.orphans?.length.toString() || '0', change: 'Alert', icon: AlertCircle, color: 'var(--danger)', description: `Potential savings: ${formatINR(azureData.orphans?.reduce((sum, o) => sum + (azureData.resourceCosts[o.id?.toLowerCase()] || 0), 0) || 0)}` },
            { label: 'Subscriptions', value: azureData.subscriptions?.length.toString() || '1', change: 'Active', icon: TrendingUp, color: 'var(--success)', description: 'MCT Developer Services' }
          ] : null} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <CostChart />
            <OrphanedResources resources={azureData.orphans?.map((o, i) => ({
              id: o.id || i,
              name: o.name,
              type: o.type,
              reason: 'Unused / Orphaned',
              cost: formatINR(azureData.resourceCosts[o.id?.toLowerCase()] || 0),
              sub: o.subscriptionId || 'Primary'
            }))} />
          </div>
        </div>
      );
    }

    if (activeView === 'Resources') {
      return <ResourceList resources={azureData.resources} loading={azureData.loading} />;
    }

    if (activeView === 'Optimization') {
      return <OrphanedResources resources={azureData.orphans?.map((o, i) => ({
        id: i,
        name: o.name,
        type: o.type.split('/').pop(),
        reason: 'Unused / Orphaned',
        cost: formatINR(o.properties?.cost || 1200),
        sub: o.subscriptionId || 'Primary'
      }))} />;
    }

    if (activeView === 'Cost Management') {
      return (
        <div className="glass-card fade-in" style={{ padding: '60px', textAlign: 'center' }}>
          <CreditCard size={48} style={{ marginBottom: '16px', color: 'var(--accent-blue)' }} />
          <h3>Cost Management & Billing</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Analyze your spending patterns and manage billing alerts.</p>
          <CostChart />
        </div>
      );
    }

    if (activeView === 'Settings') {
      return (
        <div className="glass-card fade-in" style={{ padding: '40px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SettingsIcon size={20} /> App Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Tenant</p>
              <p style={{ fontWeight: 600 }}>9cd6adc7-311b-4430-a9e1-42f8c0579762</p>
            </div>
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>MCT Developer Status</p>
              <p style={{ fontWeight: 600, color: 'var(--success)' }}>Active • Verified</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main style={{ 
        flex: 1, 
        padding: '20px 40px 40px 20px', 
        overflowY: 'auto',
        maxHeight: '100vh',
        width: '100%'
      }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          padding: '10px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, width: '100%' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activeView}</h1>
            <div className="header-search" style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '400px' 
            }}>
              <Search style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} size={18} />
              <input 
                type="text" 
                placeholder="Search resources, costs, or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '10px 10px 10px 40px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="header-actions">
            <AuthenticatedTemplate>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: 'var(--bg-card)', 
                padding: '6px 12px', 
                borderRadius: '100px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundImage: azureData.userPhoto ? `url(${azureData.userPhoto})` : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {!azureData.userPhoto && <User size={18} color="white" />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }} className="user-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{(activeAccount || accounts[0])?.name || 'User'}</span>
                    {!azureData.userPhoto && (
                      <button 
                        onClick={handleSyncPhoto}
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.2)', 
                          border: '1px solid var(--accent-blue)', 
                          borderRadius: '4px', 
                          fontSize: '9px', 
                          color: 'var(--accent-blue)', 
                          padding: '2px 6px', 
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        SYNC PHOTO
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>{(activeAccount || accounts[0])?.username}</span>
                </div>
              </div>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
              <button 
                onClick={handleLogin}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '100px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogIn size={18} />
                Connect
              </button>
            </UnauthenticatedTemplate>
          </div>
        </header>

        {/* Content Area */}
        <div className="fade-in">
          <UnauthenticatedTemplate>
            <div className="glass-card" style={{ 
              padding: '60px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{ 
                background: 'rgba(0, 242, 255, 0.1)',
                padding: '24px',
                borderRadius: '50%',
                color: 'var(--accent-blue)'
              }}>
                <ShieldCheck size={64} />
              </div>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Live Tenant Connectivity</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
                  Sign in to your Microsoft account to pull live resources, costs, and orphaned asset reports from tenant <strong>9cd6adc7-311b-4430-a9e1-42f8c0579762</strong>.
                </p>
              </div>
              <button 
                onClick={handleLogin}
                style={{
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Get Started
              </button>
            </div>
          </UnauthenticatedTemplate>

          <AuthenticatedTemplate>
            {azureData.actualCost > (azureData.budgetAmount * 0.8) && (
              <div className="glass-card fade-in" style={{ 
                background: 'rgba(255, 153, 0, 0.1)', 
                color: 'var(--warning)', 
                padding: '20px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 153, 0, 0.2)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ 
                  background: 'var(--warning)', 
                  color: 'black', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <AlertCircle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Budget Threshold Exceeded</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                    Current spend (<strong>{formatINR(azureData.actualCost)}</strong>) has crossed 80% of your defined budget (<strong>{formatINR(azureData.budgetAmount)}</strong>).
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {Math.round((azureData.actualCost / azureData.budgetAmount) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Used</div>
                </div>
              </div>
            )}

            {azureData.error && (
              <div style={{ 
                background: 'rgba(255, 77, 77, 0.1)', 
                color: 'var(--danger)', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 77, 77, 0.2)',
                marginBottom: '24px'
              }}>
                {azureData.error}
              </div>
            )}
            
            {renderContent()}
          </AuthenticatedTemplate>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default App;
