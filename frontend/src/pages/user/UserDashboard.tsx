import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Smartphone, CreditCard, AlertTriangle, Gamepad2, Database, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import './UserDashboard.css';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'topup' | 'otp' | 'history' | 'settings'>('topup');
  const [topupAmount, setTopupAmount] = useState<number>(200);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpError, setOtpError] = useState(false);

  // Profile State
  const [userName, setUserName] = useState("Rahul Kumar");
  const [userEmail, setUserEmail] = useState("rahul@securebits.io");
  const [userPhone, setUserPhone] = useState("+91 98765 43210");
  const [userTier, setUserTier] = useState("Premium");

  // Dynamic E2E State with persistence
  const [mockBankBalance, setMockBankBalance] = useState<number>(() => {
    const saved = localStorage.getItem('securebits_bank_balance');
    return saved ? Number(saved) : 50000;
  });

  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [escrowHeld, setEscrowHeld] = useState<number>(0);
  const [spentThisMonth, setSpentThisMonth] = useState<number>(0);
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [hackVelocity, setHackVelocity] = useState(0);

  const tokensReceived = topupAmount * 2;
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('securebits_bank_balance', mockBankBalance.toString());
  }, [mockBankBalance]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user/login');
      return;
    }
    try {
      const resp = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserId(resp.data.id);
      setUserName(resp.data.name);
      setUserEmail(resp.data.email);
      setUserPhone(resp.data.phone);
      setUserTier(resp.data.tier);
      // Important: Fetch dashboard data immediately after getting ID
      fetchDashboardData(resp.data.id);
    } catch (e) {
      console.error("Profile Fetch Error:", e);
      navigate('/user/login');
    }
  };

  const fetchDashboardData = async (uid: number) => {
    const token = localStorage.getItem('token');
    try {
      const resp = await axios.get(`${API_BASE_URL}/api/tokens/dashboard/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTokenBalance(resp.data.token_balance);
      setEscrowHeld(resp.data.escrow_held);
      setSpentThisMonth(resp.data.spent_this_month);
      setTxHistory(resp.data.history);
    } catch (e) {
      console.error("Dashboard Fetch Error:", e);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('securebits_bank_balance');
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE_URL}/auth/update`, {
        name: userName,
        phone: userPhone,
        email: userEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profile updated successfully!");
      fetchUserProfile();
      setActiveView('topup');
    } catch (e) {
      alert("Update failed.");
    }
  };

  const handleTopup = async () => {
    if (topupAmount > mockBankBalance) {
      alert("Insufficient funds in mock bank wallet!");
      return;
    }

    if (!userId) {
      alert("Session lost. Please re-login.");
      navigate('/user/login');
      return;
    }

    const token = localStorage.getItem('token');
    setIsProcessing(true);
    try {
      // 1. AI Realtime check
      const riskResp = await axios.post(`${API_BASE_URL}/api/fraud/analyze`, {
        amount: topupAmount,
        is_vpn_proxy: hackVelocity > 0,
        device_age_days: 100,
        recent_failed_attempts: hackVelocity,
        tx_hash: `user_tx_${Math.floor(Math.random() * 99999)}`,
        userId: userId.toString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { recommended_action, risk_score } = riskResp.data.data;

      // Artificial delay for UI "processing" feel
      setTimeout(async () => {
        setIsProcessing(false);
        if (recommended_action === 'REQUIRE_OTP' || recommended_action === 'HARD_BLOCK') {
          setActiveView('otp');
        } else {
          try {
            // 2. Execute Transaction
            await axios.post(`${API_BASE_URL}/api/tokens/topup`, {
              amount_inr: topupAmount,
              user_id: userId.toString(),
              risk_score: risk_score
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            setMockBankBalance(prev => prev - topupAmount);
            await fetchDashboardData(userId);
            setActiveView('history');
          } catch (err) {
            alert("Transaction failed at Blockchain layer. Check backend console.");
          }
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert("AI Firewall unreachable. Ensure backend is running.");
    }
  };

  const handleResetDB = async () => {
    if (!confirm("Are you sure you want to wipe the session? This will reset all your blockchain transactions.")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE_URL}/api/admin/reset-db`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMockBankBalance(50000);
      if (userId) await fetchDashboardData(userId);
      alert("Database Reset Successfully!");
    } catch (e) {
      alert("Reset failed.");
    }
  };

  const verifyOtp = async () => {
    const code = otpValue.join('');
    const token = localStorage.getItem('token');
    if (!userId) return;

    if (code === '381234' || code === '123456') {
      try {
        await axios.post(`${API_BASE_URL}/api/tokens/topup`, {
          amount_inr: topupAmount,
          user_id: userId.toString(),
          risk_score: 72
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMockBankBalance(prev => prev - topupAmount);
        await fetchDashboardData(userId);
        setActiveView('history');
        setOtpError(false);
      } catch (err) {
        alert("Capture failed.");
      }
    } else {
      setOtpError(true);
    }
  };


  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="ud-layout">
      {/* LEFT COLUMN: Profile & Summary */}
      <div className="ud-left-col">
        <div className="ud-profile-card">
          <div className="ud-avatar">{userName.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <h2 className="ud-name" style={{ fontSize: '24px', fontWeight: 700 }}>{userName}</h2>
            <p className="ud-role">Verified Gamer · {userTier}</p>
          </div>
          <div className="ud-badge-active">Active</div>
        </div>

        <div className="ud-balance-card">
          <p className="ud-label" style={{ fontSize: '14px', letterSpacing: '1px' }}>TOTAL BALANCE</p>
          <h1 className="ud-balance-amount" style={{ fontSize: '56px', fontWeight: 800 }}>{tokenBalance.toLocaleString()}</h1>
          <p className="ud-equiv" style={{ fontSize: '16px' }}>≈ ₹{(tokenBalance / 2).toLocaleString()} INR</p>

          <div className="ud-balance-actions">
            <button className="ud-btn-outline" onClick={() => setActiveView('topup')}>+ Top up</button>
            <button className="ud-btn-outline" onClick={() => setActiveView('history')}>History ↗</button>
          </div>
        </div>

        <div className="ud-stats-row">
          <div className="ud-stat-box">
            <p className="ud-label">Spent this month</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800 }}>₹{Math.floor(spentThisMonth).toLocaleString()}</h3>
            <p className="ud-sub">inr equivalent</p>
          </div>
          <div className="ud-stat-box">
            <p className="ud-label">Escrow held</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800 }}>₹{escrowHeld.toLocaleString()}</h3>
            <p className="ud-sub">secure smart contract</p>
          </div>
        </div>

        <div className="ud-activity-section" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1' }}>
          <p className="ud-section-title" style={{ color: '#818cf8' }}>QUICK ACTIONS</p>
          <div className="ud-activity-list" style={{ gap: 8, display: 'flex', flexDirection: 'column' }}>
            <button className="ud-btn-outline" onClick={() => setActiveView('settings')} style={{ textAlign: 'left', padding: '10px 12px', border: '1px solid #374151', width: '100%' }}>
              Edit Profile Details
            </button>
            <button className="ud-btn-outline" onClick={handleLogout} style={{ textAlign: 'left', padding: '10px 12px', border: '1px solid #ef4444', color: '#ef4444', width: '100%' }}>
              Logout Session
            </button>
          </div>
        </div>

        <button className="ud-btn-outline mt-10" onClick={handleResetDB} style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <RefreshCcw size={16} />
          Reset Session Data
        </button>

      </div>

      {/* RIGHT COLUMN: Dynamic Views */}
      <div className="ud-right-col">
        {activeView === 'topup' && (
          <div className="ud-view-card animate-slide-up">
            <div className="ud-view-header">
              <div className="ud-view-title" style={{ fontSize: '28px', fontWeight: 800 }}>
                <ArrowLeft size={24} style={{ marginRight: 12, cursor: 'pointer' }} onClick={() => navigate(-1)} />
                Top up tokens
              </div>
              <div className="ud-secure-badge">Razorpay secured</div>
            </div>

            <p className="ud-section-title">SELECT AMOUNT</p>
            <div className="ud-amount-grid">
              {[200, 500, 1000].map(amt => (
                <div
                  key={amt}
                  className={`ud-amount-box ${topupAmount === amt ? 'active' : ''}`}
                  onClick={() => setTopupAmount(amt)}
                >
                  <h3>₹{amt}</h3>
                  <p>{amt * 2} tokens</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <p className="ud-section-title" style={{ margin: 0 }}>PAYMENT METHOD</p>
              <span style={{ fontSize: 12, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>
                Mock Wallet: ₹{mockBankBalance.toLocaleString()}
              </span>
            </div>

            <div className="ud-payment-methods mt-4" style={{ marginTop: 16 }}>
              <div className="ud-payment-option active">
                <div className="ud-pay-icon"><Smartphone size={16} color="#000" /></div>
                <span>UPI / GPay / PhonePe</span>
                <div className="ud-radio-active" />
              </div>
              <div className="ud-payment-option">
                <div className="ud-pay-icon dark"><CreditCard size={16} /></div>
                <span>Credit / Debit card</span>
              </div>
            </div>

            <div className="ud-receipt-box">
              <div className="ud-receipt-row"><span>Amount</span><strong>₹{topupAmount}</strong></div>
              <div className="ud-receipt-row"><span>Gateway fee</span><strong className="positive">₹0 (covered)</strong></div>
              <div className="ud-receipt-row"><span>Escrow hold (98%)</span><strong>₹{Math.floor(topupAmount * 0.98)}</strong></div>
              <div className="ud-divider" />
              <div className="ud-receipt-row ud-total-row"><span>Tokens credited</span><strong>{tokensReceived} tokens</strong></div>
            </div>

            <button className="ud-btn-primary" onClick={handleTopup} disabled={isProcessing}>
              {isProcessing ? 'Contacting Bank Servers...' : `Pay ₹${topupAmount} via Razorpay ↗`}
            </button>
            <p className="ud-secure-footer">Secured by Razorpay · Tokens credited instantly</p>

            {/* Hackathon Override */}
            <div style={{ marginTop: 40, padding: 12, border: '1px dashed #4b5563', borderRadius: 8 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>HACKATHON FRAUD SIMULATOR</p>
              <label style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                Simulate High Velocity Attack:
                <input type="number" value={hackVelocity} onChange={(e) => setHackVelocity(Number(e.target.value))} style={{ width: 50, background: '#374151', color: 'white', border: 'none', borderRadius: 4, padding: '2px 4px' }} />
              </label>
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Increase this to trigger AI friction (OTP or Block).</p>
            </div>
          </div>
        )}

        {activeView === 'otp' && (
          <div className="ud-view-card animate-slide-up">
            <div className="ud-view-header mb-6">
              <div className="ud-view-title">
                <ArrowLeft size={18} style={{ marginRight: 8, cursor: 'pointer' }} onClick={() => setActiveView('topup')} />
                Security check
              </div>
            </div>

            <div className="ud-alert-warning">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={18} />
                <strong>Suspicious Activity Detected</strong>
              </div>
              <p>Unusual payout velocity from your identity. For your security, we've locked the escrow.</p>
            </div>

            <p className="ud-section-title mt-6">AI RISK SCORE</p>
            <div className="ud-risk-bar-container">
              <div className="ud-risk-labels"><span>Low risk</span><span style={{ color: '#f59e0b' }}>Score: 72</span><span>High risk</span></div>
              <div className="ud-risk-bar">
                <div className="ud-risk-fill" style={{ width: '72%' }}></div>
              </div>
              <div className="ud-risk-labels-bottom"><span>0</span><span>50</span><span>100</span></div>
            </div>

            <div className="ud-otp-section">
              <p>Enter the 6-digit OTP sent to +91 98765 ·· ·· 10</p>
              <div className="ud-otp-inputs">
                {otpValue.map((v, i) => (
                  <input
                    key={i} id={`otp-${i}`} type="text" maxLength={1} value={v}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className={otpError ? 'ud-otp-error' : ''}
                  />
                ))}
              </div>
              {otpError && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 8 }}>Invalid OTP. Use 123456</p>}
              <button className="ud-btn-primary mt-6" onClick={verifyOtp}>Verify OTP & Complete Top-up</button>
              <p className="ud-resend-link">Check terminal for mock OTP code · <span style={{ color: '#3b82f6' }}>Security Policy</span></p>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="ud-view-card animate-slide-up">
            <div className="ud-view-header align-center">
              <div className="ud-view-title">
                <ArrowLeft size={18} style={{ marginRight: 8, cursor: 'pointer' }} onClick={() => setActiveView('topup')} />
                Immutable History
              </div>
              <div className="ud-tabs">
                <button className="ud-tab-active">On-chain</button>
                <div className="ud-tab" onClick={() => userId && fetchDashboardData(userId)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RefreshCcw size={12} /> Sync
                </div>
              </div>
            </div>

            <div className="ud-history-stats mt-6 mb-6">
              <div className="ud-stat-box-small">
                <p>Tokens</p>
                <h3>{tokenBalance.toLocaleString()}</h3>
                <span>active balance</span>
              </div>
              <div className="ud-stat-box-small">
                <p>Blockchain</p>
                <h3>{txHistory.length}</h3>
                <span>minted blocks</span>
              </div>
            </div>

            <p className="ud-section-title">TRANSACTION LEDGER (SQL LITE)</p>
            <div className="ud-tx-list">
              {txHistory.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Database size={32} color="#4b5563" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: '#a3a3a3' }}>No transactions minted yet.</p>
                </div>
              ) : (
                txHistory.map((tx) => (
                  <div className="ud-tx-item" key={tx.id}>
                    <div className="ud-tx-icon" style={{ background: tx.type === 'Deduct' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)' }}>
                      {tx.type === 'Deduct' ? <Gamepad2 size={18} color="#ef4444" /> : <ArrowUpRight size={18} color="#0ea5e9" />}
                    </div>
                    <div className="ud-tx-details">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {tx.type === 'Deduct' ? 'In-game Asset Buy' : 'Token Top-up'}
                        {tx.block_id !== null && <span title="Ledger Verified"><Database size={12} color="#10b981" /></span>}
                      </h4>
                      <p>Block #{tx.block_id} · {new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                    <div className="ud-tx-right">
                      <div className={`amt ${tx.type === 'Deduct' ? 'negative' : 'positive'}`}>
                        {tx.type === 'Deduct' ? '' : '+'}{tx.token_amount.toLocaleString()} tkn
                      </div>
                      <div className={`tag ${tx.status === 'Completed' || tx.status === 'On-chain' ? 'tag-green' : 'tag-blue'}`}>{tx.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="ud-view-card animate-slide-up">
            <div className="ud-view-header">
              <div className="ud-view-title">
                <ArrowLeft size={18} style={{ marginRight: 8, cursor: 'pointer' }} onClick={() => setActiveView('topup')} />
                Profile Settings
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ marginTop: 24 }}>
              <div className="form-group mb-4">
                <label className="ud-section-title">FULL NAME</label>
                <input
                  type="text" className="form-input w-full" style={{ background: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: 8, padding: 12 }}
                  value={userName} onChange={e => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group mb-4">
                <label className="ud-section-title">EMAIL ADDRESS</label>
                <input
                  type="email" className="form-input w-full" style={{ background: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: 8, padding: 12 }}
                  value={userEmail} onChange={e => setUserEmail(e.target.value)}
                />
              </div>

              <div className="form-group mb-6">
                <label className="ud-section-title">PHONE NUMBER</label>
                <input
                  type="text" className="form-input w-full" style={{ background: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: 8, padding: 12 }}
                  value={userPhone} onChange={e => setUserPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="ud-btn-primary">
                Save Profile Changes
              </button>
            </form>

            <div style={{ marginTop: 40, padding: 16, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, border: '1px solid #2563eb' }}>
              <h4 style={{ color: '#60a5fa', marginBottom: 4 }}>Account Tier: {userTier}</h4>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Your account is managed by the central gaming organization. Some settings may be restricted.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
