import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTravel } from '../context/TravelContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useTravel();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            const response = await fetch(`${API_BASE_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (!response.ok) {
                throw new Error(t('login.error.failed'));
            }

            const data = await response.json();
            await login(data.access_token);
            navigate('/'); // Redirect to home or previous page
        } catch (err: any) {
            setError(err.message || t('login.error.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '8rem 1rem 3rem', maxWidth: '500px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>{t('login.title')}</h2>
                {error && <div style={{ color: '#ec4899', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('login.username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder={t('login.placeholder.username')}
                            className="modern-input"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('login.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="modern-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '14px',
                            background: 'var(--gradient-brand)',
                            border: 'none',
                            borderRadius: '30px',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1.05rem',
                            marginTop: '1rem',
                            transition: 'all 0.3s ease',
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)';
                        }}
                    >
                        {isLoading ? t('login.loading') : t('login.btn')}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    {t('login.no_account')} <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>{t('login.register_link')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
