import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const UserRegister: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

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
            await axios.post(`${API_URL}/auth/user/register`, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            // Redirect to Login Page as requested
            navigate('/user/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card animate-fade-in" style={{ maxWidth: '420px', padding: '40px' }}>
                <div className="text-center mb-8">
                    <div className="flex-center mb-4" style={{ color: 'var(--brand-primary)' }}>
                        <ShieldCheck size={40} strokeWidth={1.5} />
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-1px' }}>Create Wallet</h1>
                    <p style={{ color: 'var(--neutral-mid)' }}>Join the SecureBits ecosystem</p>
                </div>

                {error && (
                    <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                            <input
                                type="text" name="name" className="form-input w-full"
                                placeholder="Rahul Sharma" style={{ paddingLeft: '36px' }}
                                value={formData.name} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                            <input
                                type="email" name="email" className="form-input w-full"
                                placeholder="rahul@example.com" style={{ paddingLeft: '36px' }}
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
                                placeholder="+91 98765 43210" style={{ paddingLeft: '36px' }}
                                value={formData.phone} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                            <input
                                type="password" name="password" className="form-input w-full"
                                placeholder="••••••••" style={{ paddingLeft: '36px' }}
                                value={formData.password} onChange={handleChange} required
                            />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--neutral-mid)', marginTop: '4px' }}>
                            Must be at least 8 characters long.
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ marginTop: '16px' }}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                        {!isLoading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
                    </button>
                </form>

                <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--neutral-mid)' }}>
                    Already have a wallet?{' '}
                    <Link to="/user/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default UserRegister;
