import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const UserLogin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();
            params.append('username', formData.email); // OAuth2 expects 'username'
            params.append('password', formData.password);

            const response = await axios.post(`${API_URL}/auth/user/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user_type', 'user');
            navigate('/user-dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card animate-fade-in" style={{ maxWidth: '420px' }}>
                <div className="text-center mb-8">
                    <div className="flex-center mb-4" style={{ color: 'var(--brand-primary)' }}>
                        <Lock size={40} strokeWidth={1.5} />
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>User Sign In</h1>
                    <p style={{ color: 'var(--neutral-mid)' }}>Access your SecureBits universal wallet</p>
                </div>

                {error && (
                    <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                            <input
                                type="email" name="email" className="form-input w-full"
                                placeholder="name@email.com"
                                style={{ paddingLeft: '36px' }}
                                value={formData.email} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="flex-between">
                            <label className="form-label">Password</label>
                            <Link to="#" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                            <input
                                type={showPassword ? 'text' : 'password'} name="password"
                                className="form-input w-full" placeholder="••••••••"
                                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                                value={formData.password} onChange={handleChange} required
                            />
                            <button
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '8px' }}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        {!isLoading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
                    </button>
                </form>

                <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--neutral-mid)' }}>
                    Don't have a wallet?{' '}
                    <Link to="/user/register" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Create one now
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default UserLogin;
