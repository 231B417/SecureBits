import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2 } from 'lucide-react';

const PortalSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0F172A',
      color: '#fff',
      fontFamily: 'var(--font-family)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '16px', letterSpacing: '-2px', fontWeight: 800 }}>SecureBits</h1>
        <p style={{ color: '#94A3B8', fontSize: '1.2rem', fontWeight: 400 }}>Revolutionizing Blockchain Microtransactions</p>
      </div>

      <div style={{
        display: 'flex',
        gap: '24px',
        maxWidth: '800px',
        width: '100%',
        padding: '0 24px'
      }}>
        <div 
          onClick={() => navigate('/user/login')}
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '40px 30px',
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
            textAlign: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#6366F1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="#6366F1" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', fontWeight: 700 }}>Universal User Wallet</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Access your unified gaming wallet, view top-ups, and manage your tokens across games.
          </p>
        </div>

        <div 
          onClick={() => navigate('/auth/login')}
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '40px 30px',
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
            textAlign: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#2563EB';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={32} color="#2563EB" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', fontWeight: 700 }}>Merchant Dashboard</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Access the B2B SaaS dashboard to monitor escrow payments, fraud analytics, and integrate webhooks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalSelect;
