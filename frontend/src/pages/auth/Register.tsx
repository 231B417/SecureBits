import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, Building, Phone, Briefcase, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const strengths = ['Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['#DC2626', '#D97706', '#2563EB', '#059669'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    industry: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (formData.password.length > 7) score += 1;
    if (/[A-Z]/.test(formData.password)) score += 1;
    if (/[0-9]/.test(formData.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;
    return Math.min(score, 3);
  };

  const strength = getPasswordStrength();
  const pwdMatch = formData.password === formData.confirm_password && formData.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the Terms & Privacy Policy');
      return;
    }
    if (!pwdMatch) {
      setError('Passwords do not match');
      return;
    }
    if (strength < 2) {
      setError('Please use a stronger password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/register`, {
        company_name: formData.company_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        industry: formData.industry,
      });
      // Mock email verification flow - redirect to login for MVP
      navigate('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-fade-in" style={{ maxWidth: '540px', marginTop: '20px', marginBottom: '20px' }}>
        <div className="text-center mb-6">
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>Merchant Sign Up</h1>
          <p className="mt-2" style={{ color: 'var(--neutral-mid)' }}>Join SecureBits and eliminate gateway fees context.</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                <input
                  type="text" name="company_name" className="form-input w-full"
                  placeholder="Acme Games Pvt. Ltd."
                  style={{ paddingLeft: '36px' }}
                  value={formData.company_name} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Industry</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                <select
                  name="industry" className="form-input w-full"
                  style={{ paddingLeft: '36px', appearance: 'none', backgroundColor: 'white' }}
                  value={formData.industry} onChange={handleChange} required
                >
                  <option value="" disabled>Select Industry</option>
                  <option value="gaming">Gaming</option>
                  <option value="ai_api">AI / API Services</option>
                  <option value="livestream">Live Streaming</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
              <input
                type="email" name="email" className="form-input w-full"
                placeholder="you@company.com"
                style={{ paddingLeft: '36px' }}
                value={formData.email} onChange={handleChange} required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
              <input
                type="tel" name="phone" className="form-input w-full"
                placeholder="+91 98765 43210"
                style={{ paddingLeft: '36px' }}
                value={formData.phone} onChange={handleChange} required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" className="form-input w-full"
                  placeholder="••••••••"
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  value={formData.password} onChange={handleChange} required
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '8px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                <input
                  type={showPassword ? 'text' : 'password'} name="confirm_password" className="form-input w-full"
                  placeholder="••••••••"
                  style={{ paddingLeft: '36px', paddingRight: '36px', borderColor: pwdMatch ? 'var(--success-green)' : '' }}
                  value={formData.confirm_password} onChange={handleChange} required
                />
                {pwdMatch && <CheckCircle size={18} color="var(--success-green)" style={{ position: 'absolute', right: '10px', top: '11px' }} />}
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: i <= strength ? strengthColors[strength] : '#E5E7EB', transition: 'all 0.3s' }} />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: strengthColors[strength], fontWeight: 500, width: '40px' }}>{strengths[strength]}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '24px', gap: '10px' }}>
            <input
              type="checkbox" id="terms"
              checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }}
            />
            <label htmlFor="terms" style={{ fontSize: '14px', color: 'var(--neutral-mid)', cursor: 'pointer', lineHeight: '1.4' }}>
              I agree to the <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>Terms of Service</span> and <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>Privacy Policy</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Organization Account'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--neutral-mid)' }}>
          Already have an account?{' '}
          <Link to="/auth/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
