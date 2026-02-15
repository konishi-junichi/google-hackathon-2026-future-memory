import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { type SocialPlan, useTravel } from '../context/TravelContext';
import { useAuth } from '../context/AuthContext';
import { GeminiService } from '../services/gemini';
import { regionGroups, citiesByPrefecture, getPlaceholderImage } from '../utils/constants';

const SocialSearch: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useTravel();
    const [tagInput, setTagInput] = useState('');
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [focusedTagIndex, setFocusedTagIndex] = useState<number | null>(null);
    const [useProfileInfo, setUseProfileInfo] = useState(true);
    const [nights, setNights] = useState(1);
    const [departurePrefecture, setDeparturePrefecture] = useState('');
    const [departureCity, setDepartureCity] = useState('');
    const [results, setResults] = useState<SocialPlan[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (user?.address) {
            const parts = user.address.split(' ');
            if (parts.length >= 2) {
                setDeparturePrefecture(parts[0]);
                setDepartureCity(parts[1]);
            } else if (parts.length === 1) {
                setDeparturePrefecture(parts[0]);
            }
        }
    }, [user]);

    const performSearch = async (tags: string[]) => {
        const query = tags.join(' ');
        if (!query.trim()) return;

        setLoading(true);
        try {
            const data = await GeminiService.searchPlans(query);
            setResults(data);
            setSearched(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        const val = tagInput.trim();
        if (val && !searchTags.includes(val)) {
            const nextTags = [...searchTags, val];
            setSearchTags(nextTags);
            setTagInput('');
            return nextTags;
        }
        return searchTags;
    };

    const removeTag = (index: number) => {
        const newTags = [...searchTags];
        newTags.splice(index, 1);
        setSearchTags(newTags);
        setFocusedTagIndex(null);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                const finalTags = tagInput.trim() ? addTag() : searchTags;
                performSearch(finalTags);
            } else {
                e.preventDefault();
                addTag();
            }
        } else if (e.key === 'Backspace') {
            if (tagInput === '' && searchTags.length > 0) {
                if (focusedTagIndex !== null) {
                    removeTag(focusedTagIndex);
                } else {
                    setFocusedTagIndex(searchTags.length - 1);
                }
            }
        } else if (e.key === 'ArrowLeft') {
            if (tagInput === '' || (inputRef.current?.selectionStart === 0 && inputRef.current?.selectionEnd === 0)) {
                if (focusedTagIndex === null) {
                    setFocusedTagIndex(searchTags.length - 1);
                } else if (focusedTagIndex > 0) {
                    setFocusedTagIndex(focusedTagIndex - 1);
                }
            }
        } else if (e.key === 'ArrowRight') {
            if (focusedTagIndex !== null) {
                if (focusedTagIndex < searchTags.length - 1) {
                    setFocusedTagIndex(focusedTagIndex + 1);
                } else {
                    setFocusedTagIndex(null);
                }
            }
        } else if (e.key === 'Delete') {
            if (focusedTagIndex !== null) {
                removeTag(focusedTagIndex);
            }
        }
    };

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
            <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {t('social.title')}
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
                    {t('social.desc')}
                </p>
            </div>


            {/* Detailed Conditions Section for Social Search */}
            <div style={{ maxWidth: '700px', margin: '0 auto 3rem auto' }}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('profile.info.details_btn')}</h3>
                <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-glass-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Search Tag Input (Re-styled for inside the panel) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t('social.placeholder') || '検索キーワード'}</label>
                            <div
                                onClick={() => inputRef.current?.focus()}
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--color-glass-border)',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                    minHeight: '60px',
                                    cursor: 'text'
                                }}
                            >
                                {searchTags.map((tag, index) => (
                                    <span key={index} style={{
                                        background: focusedTagIndex === index ? 'var(--color-accent)' : 'var(--color-primary)',
                                        color: 'white',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'background 0.2s'
                                    }}>
                                        {tag}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, fontSize: '1rem' }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => { setTagInput(e.target.value); setFocusedTagIndex(null); }}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => addTag()}
                                    placeholder={searchTags.length === 0 ? t('social.placeholder') : ''}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'var(--color-text-main)',
                                        padding: '0.4rem',
                                        fontSize: '1.1rem',
                                        flex: 1,
                                        minWidth: '150px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--color-glass-border)', width: '100%' }}></div>
                        {/* Profile Usage Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{t('profile.info.toggle')}</span>
                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                <input
                                    type="checkbox"
                                    checked={useProfileInfo}
                                    onChange={(e) => setUseProfileInfo(e.target.checked)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: useProfileInfo ? 'var(--color-primary)' : '#ccc',
                                    transition: '.4s',
                                    borderRadius: '34px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '18px', width: '18px',
                                        left: useProfileInfo ? '28px' : '4px',
                                        bottom: '4px',
                                        backgroundColor: 'white',
                                        transition: '.4s',
                                        borderRadius: '50%'
                                    }}></span>
                                </span>
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Nights Dropdown */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t('profile.info.nights')}</label>
                                <select
                                    value={nights}
                                    onChange={(e) => setNights(Number(e.target.value))}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--color-glass-border)',
                                        color: 'var(--color-text-main)',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value={0} style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-main)' }}>{t('profile.info.day_trip')}</option>
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1} style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-main)' }}>
                                            {i + 1} {t('profile.info.nights_unit')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Departure Point Dropdown */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t('profile.info.departure')}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                    <select
                                        value={departurePrefecture}
                                        onChange={(e) => {
                                            setDeparturePrefecture(e.target.value);
                                            setDepartureCity('');
                                        }}
                                        style={{
                                            padding: '0.8rem',
                                            borderRadius: '10px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--color-glass-border)',
                                            color: 'var(--color-text-main)',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">{t('register.placeholder.address_pref')}</option>
                                        {regionGroups.map(group => (
                                            <optgroup key={group.region.jp} label={language === 'en' ? group.region.en : group.region.jp} style={{ background: 'var(--color-bg-dark)', color: 'var(--color-primary)' }}>
                                                {group.prefectures.map(pref => (
                                                    <option key={pref.jp} value={pref.jp} style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-main)' }}>{language === 'en' ? pref.en : pref.jp}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <select
                                        value={departureCity}
                                        onChange={(e) => setDepartureCity(e.target.value)}
                                        disabled={!departurePrefecture}
                                        style={{
                                            padding: '0.8rem',
                                            borderRadius: '10px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--color-glass-border)',
                                            color: 'var(--color-text-main)',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-main)' }}>{t('register.placeholder.address_city')}</option>
                                        {departurePrefecture && citiesByPrefecture[departurePrefecture]?.map(city => (
                                            <option key={city.jp} value={city.jp} style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-main)' }}>{language === 'en' ? city.en : city.jp}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => {
                            const finalTags = tagInput.trim() ? addTag() : searchTags;
                            performSearch(finalTags);
                        }}
                        disabled={loading || (searchTags.length === 0 && !tagInput.trim())}
                        style={{
                            padding: '1rem 4rem',
                            borderRadius: '50px',
                            background: 'var(--color-primary)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                            opacity: (loading || (searchTags.length === 0 && !tagInput.trim())) ? 0.7 : 1,
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            if (!loading && (searchTags.length > 0 || tagInput.trim())) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.4)';
                        }}
                    >
                        {loading ? t('social.searching') : t('social.search_btn')}
                    </button>
                </div>
            </div>


            {searched && (
                <div className="animate-fade-in">
                    <h3 style={{ marginBottom: '2rem' }}>{t('social.results')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {loading ? (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
                                <div className="loader"></div>
                                <p style={{ color: 'var(--color-text-muted)' }}>{t('social.searching')}</p>
                            </div>
                        ) : (
                            <>
                                {results.map((plan) => (
                                    <div
                                        key={plan.plan_id}
                                        className="glass-panel card-hover"
                                        style={{
                                            padding: '0',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/itinerary?plan_id=${plan.plan_id}`)}
                                    >
                                        <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                            <img
                                                src={(plan.thumbnail && plan.thumbnail !== "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e") ? plan.thumbnail : getPlaceholderImage(plan.plan_id)}
                                                alt={plan.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                {plan.tags?.map(tag => (
                                                    <span key={tag} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{plan.title}</h3>
                                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {plan.description}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                <span>{t('common.by')} {plan.author || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {results.length === 0 && (
                                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        {t('social.no_results')}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialSearch;
