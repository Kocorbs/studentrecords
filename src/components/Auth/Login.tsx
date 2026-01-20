'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import database from '../../services/database';
import { showInfo } from '../../utils/sweetalert';
import spcLogo from '../../assets/spc-logo.png';
import '../../styles/App.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('Admin@123');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        const currentUser = database.getCurrentUser();
        if (currentUser) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setIsLoading(true);

        try {
            const user = await database.login(username, password);

            if (user) {
                // Determine exit animation
                setIsExiting(true);
                // Wait for animation to complete before redirecting
                setTimeout(() => {
                    router.push('/dashboard');
                }, 800); // Matches CSS transition duration
            } else {
                setError('Invalid username or password');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className={`login-container ${isExiting ? 'login-exit' : ''}`}>
            {/* Left Panel - Branding */}
            <div className="login-left">
                <div className="login-branding">
                    <div className="login-logo">
                        <Image
                            src={spcLogo}
                            alt="SPC Logo"
                            width={180}
                            height={180}
                            style={{
                                objectFit: 'contain',
                                borderRadius: '50%',
                                filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.3))'
                            }}
                            priority
                        />
                    </div>
                    <div className="college-name" style={{ fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                        ST. PETER&apos;S COLLEGE
                    </div>
                    <div className="college-tagline">
                        Excelence in Education • Iligan City
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="login-right">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                        <h1 className="login-title">Welcome</h1>
                        <p className="login-subtitle">Please sign in to your administrative account</p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#FEF2F2',
                            color: '#991B1B',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '32px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textAlign: 'center',
                            border: '1px solid #FEE2E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>⚠️</span> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="modern-label">
                            Username
                        </label>
                        <div className="modern-input-group">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                className="modern-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="modern-label">
                            Password
                        </label>
                        <div className="modern-input-group">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="modern-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                />
                                Show Password
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="modern-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg className="animate-spin" viewBox="0 0 24 24" width="20" height="20" style={{ animation: 'spin 1s linear infinite' }}>
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="30 60" />
                                </svg>
                                Verifying...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <button
                            type="button"
                            onClick={() => showInfo('Password Reset', 'Please contact the IT department or system administrator to reset your credentials.')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                opacity: 0.8,
                                transition: 'var(--transition)'
                            }}
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Login;