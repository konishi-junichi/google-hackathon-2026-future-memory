import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { GeminiService } from '../services/gemini';

const Proposal: React.FC = () => {
    const navigate = useNavigate();
    const { profile, proposals, setProposals, setSelectedProposal, t, language } = useTravel();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!profile) {
            navigate('/profile');
            return;
        }

        const fetchProposals = async () => {
            // Stability check: if proposals already exist for current profile/language, skip
            const currentTagStr = profile.selectedTags.join(',');
            const profileKey = `${profile.mode}-${currentTagStr}-${profile.customAttributes}-${profile.nights}-${profile.departurePoint}-${language}`;

            // Check if we are already fetching this exact profile (debounce/strict mode protection)
            if ((window as any)._fetchingProfileKey === profileKey) {
                return;
            }

            if (proposals.length > 0 && (window as any)._lastProposalProfileKey === profileKey) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            (window as any)._fetchingProfileKey = profileKey; // Mark as fetching immediately

            try {
                const data = await GeminiService.generateProposals(
                    profile.mode,
                    language,
                    profile.selectedTags,
                    profile.customAttributes,
                    profile.nights,
                    profile.departurePoint
                );
                (window as any)._lastProposalProfileKey = profileKey;
                setProposals(data);
            } catch (error) {
                console.error("Failed to generate proposals", error);
                // Reset on error so we can try again
                (window as any)._fetchingProfileKey = null;
            } finally {
                setIsLoading(false);
                // We keep _fetchingProfileKey set if successful, effectively acting as "fetched"
                // untill _lastProposalProfileKey takes over or we navigate away? 
                // Actually, clearing it here is safer if we rely on _lastProposalProfileKey for the next check.
                (window as any)._fetchingProfileKey = null;
            }
        };

        fetchProposals();
    }, [profile, navigate, setProposals, language]);

    const handleSelect = (item: any) => {
        setSelectedProposal(item);
        navigate('/preview');
    };

    if (isLoading) {
        return (
            <div className="container" style={{
                height: '80vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <div className="animate-glide" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌠</div>
                <h2 className="text-gradient">{t('proposal.loading.title')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('proposal.loading.desc')}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
            {/* Global Navigation Area */}
            <div className="animate-fade-in" style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={() => navigate('/profile')}
                    className="nav-button"
                    style={{
                        padding: '10px 24px',
                        borderRadius: '30px',
                        backdropFilter: 'blur(10px)',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>←</span> {t('preview.back')}
                </button>
            </div>

            <div className="animate-fade-in">
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {t('proposal.title')} <span className="text-gradient">
                        {t(`profile.mode.${profile?.mode}.title` as any)}
                    </span>
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    {t('proposal.desc')}
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {proposals.map((item, index) => (
                        <div key={item.id} className="glass-panel" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            animation: `fadeIn 0.5s ease forwards ${index * 0.2}s`,
                            opacity: 0,
                            transform: 'translateY(20px)',
                            borderLeft: `4px solid ${String(item.id).charCodeAt(0) % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'}`
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{item.title}</h3>
                                <p style={{
                                    fontSize: '1.1rem',
                                    fontStyle: 'italic',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '1rem'
                                }}>
                                    "{item.tagline}"
                                </p>
                                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => handleSelect(item)}
                                    style={{
                                        padding: '0.8rem 2rem',
                                        borderRadius: '50px',
                                        border: '1px solid var(--color-primary)',
                                        background: 'transparent',
                                        color: 'var(--color-primary)',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'var(--color-primary)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-primary)';
                                    }}
                                >
                                    ▶ {t('proposal.watch')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Proposal;
