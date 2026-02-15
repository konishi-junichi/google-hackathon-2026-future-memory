import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css';
import { useTravel } from '../context/TravelContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
    const { language, setLanguage, t } = useTravel();
    const { user, isAuthenticated } = useAuth();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ja' : 'en');
    };

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    const API_HOST = API_BASE_URL.replace('/api/v1', '');

    const getImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_HOST}${url}`;
    };

    const displayImage = user ? getImageUrl(user.profile_image_url) : null;

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1000,
            padding: 'var(--spacing-sm) 0'
        }}>
            <div className="container header-glass" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '16px',
                padding: '0.8rem 1.5rem',
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <img src="/icon.png" alt="App Icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span className="text-gradient" style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        letterSpacing: '-0.02em'
                    }}>
                        {t('app.title')}
                    </span>
                </Link>
                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

                    {isAuthenticated ? (
                        <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#334155', overflow: 'hidden', border: '2px solid var(--color-glass-border)' }}>
                                {displayImage ? (
                                    <img src={displayImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.5rem' }}>👤</div>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login" className="nav-button" style={{
                            fontWeight: 600,
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                        }}>
                            {t('login')}
                        </Link>
                    )}

                    <button
                        onClick={toggleLanguage}
                        className="nav-button"
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                        }}
                    >
                        {language === 'en' ? '🇯🇵 日本語' : '🇺🇸 English'}
                    </button>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
};

export default Header;
