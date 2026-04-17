import React, { useState, useEffect } from 'react';
import { 
  Building, Phone, Key, CheckCircle, ChevronRight, ChevronLeft, LogOut, 
  LayoutDashboard, BarChart2, Receipt, ShieldAlert, Users, Landmark, 
  Code, Settings, LifeBuoy, Zap, TrendingUp, TrendingDown,
  User, Bell, Search, Filter, Download, CreditCard, ArrowRight, Check, AlertCircle, Edit, Star, Briefcase, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Form State
  const [aiAmount, setAiAmount] = useState<number>(35);
  const [aiProxy, setAiProxy] = useState<boolean>(false);
  const [aiVelocity, setAiVelocity] = useState<number>(0);
  const [aiDeviceAge, setAiDeviceAge] = useState<number>(100);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Data from Backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/metrics');
        setMetricsData(response.data);
      } catch (error) {
        console.error("Failed to load metrics", error);
      } finally {
        setLoading(false);
      }
    };
    if (isCompleted) {
      fetchMetrics();
    }
  }, [isCompleted]);

  const handleLogout = () => navigate('/auth/login');

  const runAiSimulation = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/fraud/analyze', {
        amount: aiAmount,
        is_vpn_proxy: aiProxy,
        device_age_days: aiDeviceAge,
        recent_failed_attempts: aiVelocity,
        tx_hash: `test_sim_${Math.floor(Math.random() * 10000)}`
      });
      setAiResult(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !metricsData) {
    return (
      <div className="dashboard-layout" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div className="animate-pulse" style={{color: 'var(--brand-primary)'}}>Loading Platform...</div>
      </div>
    );
  }

  const { metrics, charts } = metricsData;
  const formatINR = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;

  // RENDER HELPERS FOR TABS
  const renderSidebarItem = (id: string, label: string, Icon: React.ElementType, isAmber = false) => (
    <button 
      className={`nav-item ${activeTab === id ? 'active' : ''} ${isAmber ? 'item-upgrade' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={20} /> {label}
    </button>
  );

  const renderOverview = () => (
    <>
      <div className="content-header-title">
        <h1>Dashboard Overview</h1>
        <p className="subtitle">Your platform analytics and escrow status for today.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="card-header"><h3>Total Revenue (MTD)</h3></div>
          <div className="metric-value">{formatINR(metrics.total_revenue_mtd.value)}</div>
          <div className="metric-trend positive"><TrendingUp size={14} /> +{metrics.total_revenue_mtd.trend}% vs last month</div>
          <div className="chart-placeholder sparkline-up"></div>
        </div>

        <div className="metric-card glass-card">
          <div className="card-header"><h3>Tokens Issued</h3></div>
          <div className="metric-value">{metrics.tokens_issued.value.toLocaleString()}</div>
          <div className="metric-trend positive"><TrendingUp size={14} /> +{metrics.tokens_issued.trend}% vs last month</div>
          <div className="chart-placeholder sparkline-up"></div>
        </div>

        <div className="metric-card glass-card">
          <div className="card-header"><h3>Tokens Consumed</h3></div>
          <div className="metric-value">{metrics.tokens_consumed.value.toLocaleString()}</div>
          <div className="metric-trend neutral">Burn rate: {metrics.tokens_consumed.burn_rate}%</div>
          <div className="chart-placeholder progress-bar-container" style={{backgroundColor: 'var(--brand-light)'}}>
            <div className="progress-bar-fill" style={{width: `${metrics.tokens_consumed.burn_rate}%`, backgroundColor: 'var(--accent-purple)'}}></div>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="card-header"><h3>Active Users</h3></div>
          <div className="metric-value">{metrics.active_users.value.toLocaleString()}</div>
          <div className="metric-trend neutral">Spent tokens this week</div>
          <div className="chart-placeholder bar-chart-mini">
            <div className="bar b1"></div><div className="bar b2"></div><div className="bar b3"></div>
            <div className="bar b4"></div><div className="bar b5"></div><div className="bar b6"></div>
            <div className="bar b7 high"></div>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="card-header"><h3>Fraud Flags (MTD)</h3></div>
          <div className="metric-value text-amber">{metrics.fraud_flags.value}</div>
          <div className="metric-trend danger-text">{metrics.fraud_flags.high_risk} High Risk · {metrics.fraud_flags.medium_risk} Medium</div>
          <div className="chart-placeholder severity-blocks">
            <div className="sev-block red" style={{width: `${(metrics.fraud_flags.high_risk/metrics.fraud_flags.value)*100}%`}}></div>
            <div className="sev-block amber" style={{width: `${(metrics.fraud_flags.medium_risk/metrics.fraud_flags.value)*100}%`}}></div>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="card-header"><h3>Escrow Balance</h3></div>
          <div className="metric-value">{formatINR(metrics.escrow_balance.value)}</div>
          <div className="metric-trend neutral">Next payout: {metrics.escrow_balance.next_payout}</div>
          <div className="chart-placeholder progress-bar-container">
            <div className="progress-bar-fill" style={{width: `${metrics.escrow_balance.threshold_pct}%`}}></div>
            <div className="progress-target"></div>
          </div>
        </div>
      </div>

      <div className="charts-grid mt-6">
        <div className="chart-card glass-card">
          <h3>Revenue Over Time</h3>
          <div className="chart-filters">
            <button className="filter-btn">7D</button><button className="filter-btn active">30D</button><button className="filter-btn">90D</button>
          </div>
          <div style={{width: '100%', height: 240}}>
            <ResponsiveContainer>
              <LineChart data={charts.revenue_over_time} margin={{top: 5, right: 20, bottom: 5, left: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6B7280'}} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#6B7280'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>Token Issuance vs Consumption</h3>
          <div style={{width: '100%', height: 280}}>
            <ResponsiveContainer>
              <AreaChart data={charts.token_issuance_vs_consumption} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} />
                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="issued" stroke="#2563EB" fillOpacity={1} fill="url(#colorIssued)" />
                <Area type="monotone" dataKey="consumed" stroke="#7C3AED" fillOpacity={1} fill="url(#colorConsumed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>Top-Up Amount Distribution</h3>
          <div style={{width: '100%', height: 240}}>
            <ResponsiveContainer>
              <BarChart data={charts.topup_distribution} margin={{top: 20, right: 30, left: -10, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="range" tick={{fontSize: 10}} tickLine={false} />
                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card glass-card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
           <ShieldAlert size={48} color="var(--warning-amber)" style={{marginBottom: 16}} />
           <h3>Fraud Risk Diagnostics Active</h3>
           <p style={{color: 'var(--neutral-mid)', fontSize: 13, textAlign: 'center'}}>The AI Engine is processing signals. 42 Transactions flagged MTD.</p>
           <button className="btn btn-secondary mt-4" onClick={() => setActiveTab('fraud')}>View Security Logs</button>
        </div>
      </div>
    </>
  );

  const renderTransactions = () => (
    <div className="animate-fade-in">
      <div className="content-header-title flex-between">
        <div>
          <h1>Transactions Ledger</h1>
          <p className="subtitle">Immutable blockchain and fiat transaction log.</p>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <button className="btn btn-secondary"><Filter size={16} style={{marginRight: 8}}/> Filters</button>
          <button className="btn btn-primary"><Download size={16} style={{marginRight: 8}}/> Export CSV</button>
        </div>
      </div>
      <div className="glass-card table-container">
        <div className="table-search-bar mb-4">
          <Search size={18} color="var(--neutral-mid)" />
          <input type="text" placeholder="Search by Hash, Email, or Type..." className="search-input" />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID (Hash)</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount (INR)</th>
              <th>Tokens</th>
              <th>Status</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i}>
                <td className="hash-col" title="Click to copy">#8f91{i}a{i+2}b...</td>
                <td>user_{i}91@game.com</td>
                <td>{i % 3 === 0 ? 'Token Spend' : 'Top-Up'}</td>
                <td>{i % 3 === 0 ? '-' : `₹${500 * (i+1)}`}</td>
                <td style={{color: i % 3 === 0 ? 'var(--danger-red)' : 'var(--success-green)'}}>
                  {i % 3 === 0 ? '-100' : `+${1000 * (i+1)}`}
                </td>
                <td><span className={`badge ${i === 2 ? 'badge-amber' : 'badge-green'}`}>{i === 2 ? 'Flagged' : 'Completed'}</span></td>
                <td><span style={{color: i === 2 ? 'var(--warning-amber)' : 'var(--success-green)'}}>{i === 2 ? '68' : '12'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFraudMonitor = () => (
    <div className="animate-fade-in">
      <div className="content-header-title">
        <h1>Fraud Monitor</h1>
        <p className="subtitle">Real-time AI engine flags and OTP triggers.</p>
      </div>
      <div className="charts-grid mb-6">
        <div className="glass-card mb-4" style={{gridColumn: '1 / -1'}}>
          <div className="flex-between mb-4">
            <h3>Live AI Diagnostics Terminal</h3>
            <span className="badge badge-amber">Simulation Mode</span>
          </div>
          <p className="subtitle mb-4" style={{fontSize: 14}}>Inject vectors into the local AI Engine (<code>/api/fraud/analyze</code>) to test risk algorithms.</p>
          <div style={{display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap'}}>
             <div className="form-group flex-1">
               <label className="form-label">Txn Amount (INR)</label>
               <input type="number" className="form-input" value={aiAmount} onChange={e => setAiAmount(Number(e.target.value))} />
             </div>
             <div className="form-group flex-1">
               <label className="form-label">Failed Attempts</label>
               <input type="number" className="form-input" value={aiVelocity} onChange={e => setAiVelocity(Number(e.target.value))} />
             </div>
             <div className="form-group flex-1">
               <label className="form-label">Device Age (Days)</label>
               <input type="number" className="form-input" value={aiDeviceAge} onChange={e => setAiDeviceAge(Number(e.target.value))} />
             </div>
             <div className="form-group flex-1" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
               <label className="form-label">VPN / Proxy Exit Node</label>
               <div style={{display: 'flex', alignItems: 'center', gap: 8, height: '100%'}}>
                 <input type="checkbox" checked={aiProxy} onChange={e => setAiProxy(e.target.checked)} style={{width: 18, height: 18, accentColor: 'var(--brand-primary)'}} />
                 <span>{aiProxy ? 'Yes (Malicious)' : 'No'}</span>
               </div>
             </div>
          </div>
          <button className="btn btn-primary" onClick={runAiSimulation} disabled={aiLoading}>
             {aiLoading ? 'Analyzing Vectors...' : 'Score with AI Engine'}
          </button>
          
          {aiResult && (
            <div className="mt-6 p-4" style={{background: 'var(--neutral-light)', border: '1px solid var(--neutral-mid)', borderRadius: 8}}>
               <h4 className="mb-2">Isolation Forest Diagnostics: <code>{aiResult.tx_hash}</code></h4>
               <div className="flex-between" style={{alignItems: 'flex-start'}}>
                 <div>
                   <p className="text-neutral" style={{fontSize: 14}}>Risk Score (<span style={{color: 'var(--neutral-mid)'}}>0-100</span>): <br/><strong style={{color: aiResult.risk_score > 65 ? 'var(--danger-red)' : 'var(--success-green)', fontSize: 32}}>{aiResult.risk_score}</strong></p>
                   <p className="mt-2 text-neutral" style={{fontSize: 14}}>Recommended Output Policy:<br/> <strong style={{fontSize: 16, color: 'var(--text-main)'}}>{aiResult.recommended_action.replace(/_/g, ' ')}</strong></p>
                 </div>
                 <div style={{minWidth: 200}}>
                   <p className="text-neutral mb-1" style={{fontSize: 14}}>Triggered Heuristics:</p>
                   <ul style={{margin: 0, paddingLeft: 20, fontSize: 13}}>
                      {aiResult.signals.map((sig: string, i: number) => <li key={i} style={{color: sig.includes("Clean") ? 'var(--success-green)' : 'var(--danger-red)', fontWeight: sig.includes("Clean") ? 'normal' : 'bold'}}>{sig}</li>)}
                   </ul>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="glass-card" style={{gridColumn: '1 / -1'}}>
          <div className="alert-box danger-red mb-4" style={{background: 'rgba(220, 38, 38, 0.1)', color: 'var(--danger-red)', border: '1px solid rgba(220, 38, 38, 0.2)'}}>
            <strong>Critical Alert:</strong> 3 transactions blocked in the last hour due to IP Velocity mismatch.
          </div>
          <h3>Recent Suspicious Activity</h3>
          <table className="data-table mt-4">
            <thead>
              <tr>
                <th>Time</th>
                <th>User / IP</th>
                <th>Signal Types</th>
                <th>Risk Score</th>
                <th>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10 mins ago</td>
                <td>193.12.X.X (Russia)</td>
                <td>IP Velocity, New Device</td>
                <td className="text-danger font-bold">85</td>
                <td><span className="badge badge-red">Blocked</span></td>
              </tr>
              <tr>
                <td>42 mins ago</td>
                <td>VPN Exit Node</td>
                <td>Proxy Detected</td>
                <td className="text-amber font-bold">65</td>
                <td><span className="badge badge-amber">OTP Triggered</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApiIntegration = () => (
    <div className="animate-fade-in">
      <div className="content-header-title">
        <h1>API & Integration</h1>
        <p className="subtitle">Manage your API keys and webhook architecture.</p>
      </div>
      <div className="glass-card mb-6">
        <div className="flex-between mb-4">
          <div>
            <h3>Live API Keys</h3>
            <p className="text-neutral">Use these to authenticate your backend server requests.</p>
          </div>
          <button className="btn btn-primary"><Plus size={16} className="mr-2"/> Create New Key</button>
        </div>
        <div className="api-key-box mb-4">
          <div className="key-label">Secret API Key</div>
          <div className="key-value-container flex-between">
            <code className="key-value">tp_live_9F8H23NC8Y4XCM91PQZM002</code>
            <button className="btn btn-secondary" style={{height: 32, fontSize: 12}}>Copy</button>
          </div>
        </div>
        <button className="btn btn-secondary text-danger">Revoke Key</button>
      </div>
      <div className="glass-card">
        <h3>Webhook Configuration</h3>
        <p className="mb-4">Receive real-time updates for TokenPay events.</p>
        <div className="form-group">
          <label className="form-label">Endpoint URL</label>
          <div style={{display: 'flex', gap: 12}}>
            <input type="url" className="form-input w-full" defaultValue="https://api.acmegames.com/webhooks/tokenpay" />
            <button className="btn btn-secondary">Test</button>
            <button className="btn btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- NEW TABS ADDED BELOW --- //

  const renderAnalytics = () => {
    const demData = [
      { name: 'Active Gamers', value: 400 },
      { name: 'Occasional Spenders', value: 300 },
      { name: 'Dormant', value: 300 },
    ];
    const COLORS = ['#2563EB', '#7C3AED', '#E5E7EB'];
    
    return (
      <div className="animate-fade-in">
        <div className="content-header-title">
          <h1>Token Analytics</h1>
          <p className="subtitle">Deep dive into user token demographics.</p>
        </div>
        <div className="charts-grid mb-6">
          <div className="glass-card chart-card">
            <h3>Token Holder Segments</h3>
            <div style={{width: '100%', height: 280}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={demData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {demData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: 8, border: 'none'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-center" style={{gap: 16}}>
              <span style={{fontSize: 12, color: 'var(--neutral-mid)'}}><span style={{color: '#2563EB', fontWeight: 'bold'}}>●</span> Active Gamers</span>
              <span style={{fontSize: 12, color: 'var(--neutral-mid)'}}><span style={{color: '#7C3AED', fontWeight: 'bold'}}>●</span> Occasional</span>
            </div>
          </div>
          <div className="glass-card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <h3>Top Token Spenders</h3>
            <p style={{fontSize: 13, color: 'var(--neutral-mid)', marginBottom: 16}}>Top 1% of users account for 45% of total consumption.</p>
            <table className="data-table">
              <tbody>
                <tr><td>user_991@game.com</td><td style={{textAlign:'right', fontWeight: 'bold'}}>15,400 TPK</td></tr>
                <tr><td>alpha_king@gmail.com</td><td style={{textAlign:'right', fontWeight: 'bold'}}>12,200 TPK</td></tr>
                <tr><td>zeta_warrior@proton.me</td><td style={{textAlign:'right', fontWeight: 'bold'}}>9,800 TPK</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="animate-fade-in">
      <div className="content-header-title flex-between">
        <div>
          <h1>User Directory</h1>
          <p className="subtitle">Manage user wallets and token actions manually.</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} className="mr-2"/> Add User</button>
      </div>
      <div className="glass-card table-container">
        <div className="table-search-bar mb-4">
          <Search size={18} color="var(--neutral-mid)" />
          <input type="text" placeholder="Search users by email or ID..." className="search-input" />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Current Balance</th>
              <th>Lifetime Spent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="hash-col">usr_9{i}x2</td>
                <td>player{i}@gamerhub.link</td>
                <td style={{fontWeight: 600, color: 'var(--brand-primary)'}}>{(i+1) * 1250} TPK</td>
                <td>{(i+2) * 4500} TPK</td>
                <td><span className="badge badge-green">Active</span></td>
                <td>
                  <button className="btn btn-secondary" style={{padding: '4px 8px', fontSize: 12}}>Allocate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayouts = () => (
    <div className="animate-fade-in">
      <div className="content-header-title">
        <h1>Escrow & Payouts</h1>
        <p className="subtitle">Monitor your transparent blockchain escrow releases.</p>
      </div>
      <div className="metrics-grid mb-6">
        <div className="glass-card" style={{gridColumn: 'span 2'}}>
          <h3>Next Scheduled Cycle</h3>
          <h1 style={{fontSize: 48, letterSpacing: '-1px', margin: '16px 0', color: 'var(--text-main)'}}>₹ 3,45,000</h1>
          <div className="progress-bar-container" style={{height: 12, marginBottom: 8}}>
            <div className="progress-bar-fill" style={{width: '65%'}}></div>
            <div className="progress-target" style={{left: '100%', borderColor: 'transparent'}}></div>
          </div>
          <p style={{fontSize: 13, color: 'var(--neutral-mid)'}}>65% into billing cycle. Releasing directly to your linked bank account on <strong>November 1st</strong>.</p>
          <div style={{marginTop: 24, display: 'flex', gap: 12}}>
            <button className="btn btn-primary"><Landmark size={18} className="mr-2"/> Update Bank Details</button>
            <button className="btn btn-secondary" style={{color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)'}}>Request Early Payout (-1% Fee)</button>
          </div>
        </div>
        <div className="glass-card">
          <h3>Recent Payouts</h3>
          <table className="data-table mt-4">
            <tbody>
              <tr><td>Oct 1st</td><td style={{textAlign: 'right', fontWeight: 'bold'}}>₹ 4,12,000</td></tr>
              <tr><td>Sep 1st</td><td style={{textAlign: 'right', fontWeight: 'bold'}}>₹ 3,98,400</td></tr>
              <tr><td>Aug 1st</td><td style={{textAlign: 'right', fontWeight: 'bold'}}>₹ 2,10,000</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="animate-fade-in">
      <div className="content-header-title flex-between">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Configure your workspace and Token Economics.</p>
        </div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
      
      <div className="charts-grid">
        <div className="glass-card">
          <h3 className="mb-4">Organization Profile</h3>
          <div className="form-group mb-4">
            <label className="form-label">Company Name</label>
            <input type="text" className="form-input" defaultValue="Acme Games Pvt. Ltd." />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Support Email</label>
            <input type="email" className="form-input" defaultValue="support@acmegames.com" />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Industry</label>
            <select className="form-input">
              <option>Gaming / Metaverse</option>
              <option>Digital Creators</option>
              <option>SaaS API</option>
            </select>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex-between mb-4">
            <h3>Token Economy Rules</h3>
            <span className="badge badge-amber">Dangerous</span>
          </div>
          <p className="text-neutral mb-4" style={{fontSize: 13}}>Adjusting the peg ratio affects all future top-ups. Previous escrows are unaffected.</p>
          <div className="form-group mb-4">
            <label className="form-label">Conversion Rate (INR to Tokens)</label>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <span style={{fontWeight: 600}}>₹ 1</span>
              <span>=</span>
              <input type="number" className="form-input" defaultValue="10" style={{width: 100}} />
              <span>Tokens</span>
            </div>
          </div>
          <div className="form-group mt-6">
            <label className="form-label">Minimum Top-Up Amount (INR)</label>
            <input type="number" className="form-input w-full" defaultValue="50" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="animate-fade-in">
      <div className="content-header-title flex-between">
        <div>
          <h1>Support & Help Center</h1>
          <p className="subtitle">Priority enterprise support active.</p>
        </div>
        <button className="btn btn-primary">Open New Ticket</button>
      </div>
      <div className="glass-card mb-6 flex-between" style={{background: 'linear-gradient(135deg, var(--brand-primary), #60A5FA)', color: 'white'}}>
        <div>
          <h2 style={{color: 'white', marginBottom: 8}}>Dedicated Account Manager</h2>
          <p style={{opacity: 0.9}}>Sarah Jenkins is assigned to your account. Typical response time &lt; 2 hours.</p>
        </div>
        <button className="btn" style={{background: 'white', color: 'var(--brand-primary)', fontWeight: 'bold'}}>Chat Now</button>
      </div>
      <div className="glass-card table-container">
        <h3>Active Tickets</h3>
        <table className="data-table mt-4">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="hash-col">#TIC-8812</td>
              <td>Webhook payload missing user metadata payload...</td>
              <td>2 hours ago</td>
              <td><span className="badge badge-amber">Pending Staff</span></td>
            </tr>
            <tr>
              <td className="hash-col">#TIC-8744</td>
              <td>Requesting custom checkout styling.</td>
              <td>Yesterday</td>
              <td><span className="badge badge-green">Resolved</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUpgrade = () => (
    <div className="animate-fade-in text-center">
      <div className="content-header-title mx-auto" style={{maxWidth: 600}}>
        <h1>Pricing Plans</h1>
        <p className="subtitle mb-6 text-center">Transparent volume-based pricing. Escrow protection included.</p>
      </div>
      <div className="charts-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'left'}}>
        {/* Free Plan */}
        <div className="glass-card pb-8">
          <h2 className="mb-2">Starter</h2>
          <h1 className="mb-4 text-main">0% <span style={{fontSize: 16, color: 'var(--neutral-mid)', fontWeight: 'normal'}}>/ Gateway Fee</span></h1>
          <p className="text-neutral mb-6" style={{fontSize: 14, minHeight: 40}}>Perfect for indie devs testing the ecosystem.</p>
          <button className="btn btn-secondary w-full mb-6">Downgrade to Starter</button>
          <ul style={{listStyle: 'none', padding: 0, gap: 12, display: 'flex', flexDirection: 'column'}}>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--success-green)"/> Up to 5,000 monthly txns</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--success-green)"/> Standard Fraud Engine</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--success-green)"/> Basic API Access</li>
          </ul>
        </div>
        {/* Growth Plan - Active */}
        <div className="glass-card pb-8" style={{border: '2px solid var(--brand-primary)', position: 'relative', transform: 'scale(1.02)'}}>
          <div style={{position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-primary)', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 'bold'}}>CURRENT PLAN</div>
          <h2 className="mb-2">Growth</h2>
          <h1 className="mb-4 text-main">₹4,999 <span style={{fontSize: 16, color: 'var(--neutral-mid)', fontWeight: 'normal'}}>/ month</span></h1>
          <p className="text-neutral mb-6" style={{fontSize: 14, minHeight: 40}}>For scaling apps heavily utilizing micro-transactions.</p>
          <button className="btn btn-primary w-full mb-6" disabled>Active Plan</button>
          <ul style={{listStyle: 'none', padding: 0, gap: 12, display: 'flex', flexDirection: 'column'}}>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--brand-primary)"/> Up to 50,000 monthly txns</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--brand-primary)"/> Advanced AI IP/Proxy blocking</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--brand-primary)"/> Zapier / Webhooks</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Check size={16} color="var(--brand-primary)"/> Next-day Payouts</li>
          </ul>
        </div>
        {/* Enterprise Plan */}
        <div className="glass-card pb-8" style={{background: 'var(--surface-color)'}}>
          <h2 className="mb-2">Enterprise</h2>
          <h1 className="mb-4 text-main">Custom</h1>
          <p className="text-neutral mb-6" style={{fontSize: 14, minHeight: 40}}>Dedicated hardware routing and 99.99% uptime SLAs.</p>
          <button className="btn btn-primary w-full mb-6" style={{background: 'var(--text-main)'}}>Contact Sales</button>
          <ul style={{listStyle: 'none', padding: 0, gap: 12, display: 'flex', flexDirection: 'column'}}>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Briefcase size={16} color="var(--text-main)"/> Unlimited txns</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Briefcase size={16} color="var(--text-main)"/> Bespoke ML Model Training</li>
            <li className="flex-start" style={{gap: 8, fontSize: 13}}><Briefcase size={16} color="var(--text-main)"/> Dedicated Account Manager</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // VIEW ROUTER
  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'transactions': return renderTransactions();
      case 'fraud': return renderFraudMonitor();
      case 'api': return renderApiIntegration();
      case 'analytics': return renderAnalytics();
      case 'users': return renderUsers();
      case 'payouts': return renderPayouts();
      case 'settings': return renderSettings();
      case 'support': return renderSupport();
      case 'upgrade': return renderUpgrade();
      default: return renderOverview();
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar fixed-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon-tp">TP</div>
          <h2>TokenPay</h2>
        </div>
        <nav className="sidebar-nav">
          {renderSidebarItem('overview', 'Dashboard Home', LayoutDashboard)}
          {renderSidebarItem('analytics', 'Token Analytics', BarChart2)}
          {renderSidebarItem('transactions', 'Transactions', Receipt)}
          {renderSidebarItem('fraud', 'Fraud Monitor', ShieldAlert)}
          {renderSidebarItem('users', 'Users', Users)}
          {renderSidebarItem('payouts', 'Payouts', Landmark)}
          {renderSidebarItem('api', 'API & Integration', Code)}
          {renderSidebarItem('settings', 'Settings', Settings)}
          {renderSidebarItem('support', 'Support', LifeBuoy)}
          <div className="nav-divider"></div>
          {renderSidebarItem('upgrade', 'Upgrade Plan', Zap, true)}
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <div className="org-logo-placeholder">A</div>
            <span className="org-name">Acme Games Pvt. Ltd.</span>
            <span className="plan-badge">Growth Plan</span>
          </div>
          <div className="header-right">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-avatar-dropdown">
              <User size={20} />
              <span className="avatar-name">Admin</span>
            </div>
            <button onClick={handleLogout} className="icon-btn text-danger ml-2" title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
