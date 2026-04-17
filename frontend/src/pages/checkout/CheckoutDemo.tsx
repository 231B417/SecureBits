import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, ShieldAlert, CreditCard, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './CheckoutDemo.css';

export default function CheckoutDemo() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'checkout' | 'otp' | 'success'>('checkout');

  // Simulation Vectors (what the presenter controls)
  const [aiAmount, setAiAmount] = useState<number>(35);
  const [aiProxy, setAiProxy] = useState<boolean>(false);
  const [aiVelocity, setAiVelocity] = useState<number>(0);

  // Verification State
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Ping the AI engine
      const response = await axios.post('http://127.0.0.1:8000/api/fraud/analyze', {
        amount: aiAmount,
        is_vpn_proxy: aiProxy,
        device_age_days: aiProxy ? 0 : 150, // if proxy, pretend new device
        recent_failed_attempts: aiVelocity,
        tx_hash: `chk_${Math.floor(Math.random() * 99999)}`
      });

      const { recommended_action } = response.data.data;
      
      setTimeout(() => {
        setLoading(false);
        if (recommended_action === 'REQUIRE_OTP' || recommended_action === 'HARD_BLOCK') {
          // In a real app HARD_BLOCK would just fail, but we'll show OTP for demo
          if (recommended_action === 'HARD_BLOCK' && !aiVelocity) {
              alert("CRITICAL FRAUD: Transaction instantly blocked by Network Rules.");
              return;
          }
          setStep('otp');
        } else {
          setStep('success');
        }
      }, 1000); // 1s simulation delay

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456') {
      setStep('success');
    } else {
      setOtpError(true);
    }
  };

  return (
    <div className="checkout-layout">
      {/* Fake Game Store Header */}
      <header className="store-header">
        <h2>⚔️ Acme Battle Arena</h2>
        <span className="user-bal">Logged in as: <strong>player_one@proton.me</strong></span>
      </header>

      {/* Main Container */}
      <main className="checkout-container">
        
        {step === 'checkout' && (
          <div className="checkout-card">
            <div className="item-details">
              <div className="item-icon">🛡️</div>
              <div className="item-meta">
                <h2>Paladin Armor Pack</h2>
                <p>Limited Edition Cosmic Gear</p>
              </div>
              <div className="item-price">
                <span>{aiAmount} Tokens</span>
              </div>
            </div>

            <div className="tp-divider"></div>

            <div className="tp-payment-widget">
              <div className="tp-widget-header">
                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <ShieldCheck size={18} color="#2563EB" />
                  <span className="tp-brand">TokenPay Secure</span>
                </div>
                <span className="tp-badge">Zero Fees</span>
              </div>
              <p className="tp-description">Your current balance is 1,250 Tokens.</p>
              
              <button 
                className="tp-pay-btn" 
                onClick={handleCheckout} 
                disabled={loading}
              >
                {loading ? 'Processing via TokenPay...' : `Pay ${aiAmount} Tokens`}
              </button>
            </div>

            {/* HACKATHON PRESENTER CONTROLS */}
            <div className="hackathon-controls">
              <div className="hack-header">
                <AlertTriangle size={14} color="#F59E0B" />
                <span>Demo Presenter Controls</span>
              </div>
              <div className="hack-body">
                <div className="hack-row flex-between">
                  <span>Txn Override Amount:</span>
                  <input type="number" value={aiAmount} onChange={e=>setAiAmount(Number(e.target.value))} style={{width: 60}} />
                </div>
                <div className="hack-row flex-between">
                  <span>Simulate VPN Exit Node:</span>
                  <input type="checkbox" checked={aiProxy} onChange={e=>setAiProxy(e.target.checked)} />
                </div>
                <div className="hack-row flex-between">
                  <span>Inject Failed Attempts:</span>
                  <input type="number" value={aiVelocity} onChange={e=>setAiVelocity(Number(e.target.value))} style={{width: 60}} />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="checkout-card otp-card">
             <div className="otp-icon-wrapper">
               <ShieldAlert size={42} color="#DC2626" />
             </div>
             <h2>Security Verification</h2>
             <p className="otp-desc">TokenPay AI detected unusual activity (Proxy Vector). Please enter the 6-digit code sent to your registered device.</p>
             
             <div className="otp-input-group">
               <input 
                 type="text" 
                 maxLength={6} 
                 placeholder="123456"
                 value={otpCode}
                 onChange={(e) => {
                   setOtpCode(e.target.value);
                   setOtpError(false);
                 }}
                 className={otpError ? 'error-border' : ''}
               />
               {otpError && <span className="error-text">Invalid code. Hint: 123456</span>}
             </div>

             <button className="tp-pay-btn" onClick={handleVerifyOtp}>
               Verify & Complete Purchase
             </button>
          </div>
        )}

        {step === 'success' && (
          <div className="checkout-card success-card">
             <div className="success-icon-wrapper">
               <CheckCircle size={56} color="#10B981" />
             </div>
             <h2>Transaction Complete!</h2>
             <p>Your Paladin Armor Pack has been injected directly into your game inventory.</p>
             <div className="receipt-box">
                <div className="flex-between"><span>Amount Paid</span><strong>{aiAmount} Tokens</strong></div>
                <div className="flex-between mt-2"><span>Network Fee</span><strong>0 Tokens</strong></div>
                <div className="tp-divider"></div>
                <div className="flex-between"><span>Remaining Balance</span><strong>{1250 - aiAmount} Tokens</strong></div>
             </div>
             <button className="btn btn-secondary w-full" onClick={() => setStep('checkout')}>
               Return to Store
             </button>
          </div>
        )}

      </main>
    </div>
  );
}
