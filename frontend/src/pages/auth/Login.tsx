import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard'); // Mock route for now
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex-center mb-4" style={{ color: 'var(--brand-primary)' }}>
            <Lock size={40} strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>Merchant Sign In</h1>
          <p style={{ color: 'var(--neutral-mid)' }}>Sign in to your SecureBits dashboard</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
              <input
                type="email"
                className="form-input w-full"
                placeholder="you@company.com"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/auth/forgot-password" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input w-full"
                placeholder="••••••••"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <input type="checkbox" id="remember" style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }} />
            <label htmlFor="remember" style={{ fontSize: '14px', color: 'var(--neutral-mid)', cursor: 'pointer' }}>Remember me for 30 days</label>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-6">
          <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#E5E7EB', zIndex: 0 }}></div>
            <span style={{ position: 'relative', background: 'white', padding: '0 12px', color: '#6B7280', fontSize: '14px', zIndex: 1 }}>Or continue with</span>
          </div>

          <button
            type="button"
            className="btn btn-outline w-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={async () => {
              setIsLoading(true);
              try {
                const res = await axios.post(`${API_URL}/auth/oauth/google`);
                localStorage.setItem('token', res.data.access_token);
                navigate('/dashboard');
              } catch (e) {
                setError("Social login failed.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.4939 12.2747C23.4939 11.4607 23.4243 10.6807 23.294 9.93933H12V14.352H18.4523C18.174 15.8567 17.3223 17.1307 16.0527 17.9827V20.8413H20.0163C22.3353 18.7053 23.4939 15.7833 23.4939 12.2747Z" fill="#4285F4" />
              <path d="M12 24C15.24 24 17.9543 22.9227 19.9483 21.0773L16.0527 17.984C15.0217 18.6693 13.626 19.0667 12 19.0667C8.86533 19.0667 6.213 16.9453 5.26733 14.072H1.24V17.1893C3.25367 21.1893 7.337 23.9067 12 23.9067V24Z" fill="#34A853" />
              <path d="M5.26733 14.072C5.01333 13.316 4.86933 12.508 4.86933 11.6667C4.86933 10.8253 5.01333 10.0173 5.26733 9.26133V6.144H1.24C0.450333 7.71267 0 9.47733 0 11.3333C0 13.1893 0.450333 14.954 1.24 16.5227L5.26733 14.072Z" fill="#FBBC05" />
              <path d="M12 4.70667C13.7333 4.70667 15.3 5.304 16.5227 6.47467L19.9483 3.04933C17.9543 1.196 15.24 0 12 0C7.337 0 3.25367 2.71733 1.24 6.71733L5.26733 9.83467C6.213 6.96133 8.86533 4.70667 12 4.70667Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--neutral-mid)' }}>
          New to SecureBits?{' '}
          <Link to="/auth/register" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
