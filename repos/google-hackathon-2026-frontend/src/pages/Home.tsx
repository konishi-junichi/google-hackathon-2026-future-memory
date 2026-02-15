import React from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

const Home: React.FC = () => {
    const { t } = useTravel();

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '8rem var(--spacing-md) 2rem',
                paddingTop: 'max(8rem, 15vh)'
            }}>
                <div className="animate-fade-in" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 5rem)',
                        marginBottom: 'var(--spacing-sm)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em'
                    }}>
                        {t('home.hero.title1')} <br />
                        <span className="text-gradient">{t('home.hero.title2')}</span>
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-text-muted)',
                        maxWidth: '600px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        {t('home.hero.desc')}
                    </p>
                </div>

                {/* Main Action Buttons */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    width: '100%',
                    maxWidth: '800px',
                    padding: '0 1rem'
                }}>
                    {/* Personal Mode */}
                    <Link to="/profile" className="glass-panel glass-panel-interactive" style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
                        <h2 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{t('home.mode.personal.title')}</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {t('home.mode.personal.desc')}
                        </p>
                    </Link>

                    {/* Social Mode */}
                    <Link to="/social" className="glass-panel glass-panel-interactive" style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌏</div>
                        <h2 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{t('home.mode.social.title')}</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {t('home.mode.social.desc')}
                        </p>
                    </Link>
                </div>

                {/* Background Element */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(60px)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />
            </section>
        </div>
    );
};

export default Home;
