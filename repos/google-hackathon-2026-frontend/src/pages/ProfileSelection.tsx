import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { useAuth } from '../context/AuthContext';
import { regionGroups, citiesByPrefecture, type LocalizedItem } from '../utils/constants';

const travelModes = [
    { id: 'solo', titleKey: 'profile.mode.solo.title', descKey: 'profile.mode.solo.desc', icon: '🚶' },
    { id: 'senior', titleKey: 'profile.mode.senior.title', descKey: 'profile.mode.senior.desc', icon: '🍵' },
    { id: 'family', titleKey: 'profile.mode.family.title', descKey: 'profile.mode.family.desc', icon: '👨‍👩‍👧‍👦' },
    { id: 'active', titleKey: 'profile.mode.active.title', descKey: 'profile.mode.active.desc', icon: '🏃' },
    { id: 'influencer', titleKey: 'profile.mode.influencer.title', descKey: 'profile.mode.influencer.desc', icon: '📸' }
];

const modeTags: Record<string, LocalizedItem[]> = {
    solo: [
        { jp: "静かな空間", en: "Quiet Space" },
        { jp: "ローカルフード", en: "Local Food" },
        { jp: "サウナ", en: "Sauna" },
        { jp: "読書", en: "Reading" },
        { jp: "夜散歩", en: "Night Walk" },
        { jp: "路地裏迷い込み", en: "Back Alley Exploration" },
        { jp: "カウンター席あり", en: "Counter Seats Available" },
        { jp: "ブックカフェ", en: "Book Cafe" },
        { jp: "地酒", en: "Local Sake" }
    ],
    senior: [
        { jp: "歴史巡り", en: "History Tour" },
        { jp: "温泉", en: "Hot Spring (Onsen)" },
        { jp: "庭園", en: "Japanese Garden" },
        { jp: "伝統文化", en: "Traditional Culture" },
        { jp: "ゆっくり散策", en: "Relaxed Stroll" },
        { jp: "タクシー移動重視", en: "Taxi Oriented" },
        { jp: "バリアフリー", en: "Barrier Free" },
        { jp: "老舗", en: "Long-established Shop" },
        { jp: "懐石料理", en: "Kaiseki Cuisine" }
    ],
    family: [
        { jp: "動物園・水族館", en: "Zoo / Aquarium" },
        { jp: "体験教室", en: "Workshops" },
        { jp: "公園", en: "Park" },
        { jp: "子供メニューあり", en: "Kids Menu" },
        { jp: "ベビーカー貸出", en: "Stroller Rental" },
        { jp: "授乳室完備", en: "Nursing Room" },
        { jp: "ピクニック", en: "Picnic" },
        { jp: "遊園地", en: "Amusement Park" },
        { jp: "ファミリー向け", en: "Family Friendly" }
    ],
    active: [
        { jp: "絶景", en: "Spectacular View" },
        { jp: "隠れた名所", en: "Hidden Gems" },
        { jp: "朝活", en: "Morning Activity" },
        { jp: "階段・坂道歓迎", en: "Hills & Stairs OK" },
        { jp: "地元の足", en: "Local Transport" },
        { jp: "パワースポット", en: "Power Spot" },
        { jp: "トレッキング", en: "Trekking" },
        { jp: "レンタサイクル", en: "Rental Cycle" },
        { jp: "早朝周遊", en: "Early Morning Tour" }
    ],
    influencer: [
        { jp: "写真映え", en: "Photogenic" },
        { jp: "トレンドスイーツ", en: "Trending Sweets" },
        { jp: "夜景", en: "Night View" },
        { jp: "アート", en: "Art" },
        { jp: "セレクトショップ", en: "Select Shop" },
        { jp: "話題のホテル", en: "Trendy Hotel" },
        { jp: "テラス席", en: "Terrace Seats" },
        { jp: "期間限定", en: "Limited Time" },
        { jp: "ラグジュアリー", en: "Luxury" }
    ]
};

const ProfileSelection: React.FC = () => {
    const navigate = useNavigate();
    const { profile, setProfile, t, setProposals, language } = useTravel();
    const { user } = useAuth();
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [useProfileInfo, setUseProfileInfo] = useState(true);
    const [nights, setNights] = useState(1);
    const [departurePrefecture, setDeparturePrefecture] = useState('');
    const [departureCity, setDepartureCity] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [focusedTagIndex, setFocusedTagIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const addCustomTag = () => {
        const val = tagInput.trim();
        if (val && !customTags.includes(val)) {
            setCustomTags([...customTags, val]);
            setTagInput('');
        }
    };

    const removeCustomTag = (index: number) => {
        const newTags = [...customTags];
        newTags.splice(index, 1);
        setCustomTags(newTags);
        setFocusedTagIndex(null);
        inputRef.current?.focus();
    };

    useEffect(() => {
        if (profile) {
            // Restore from context
            setSelectedMode(profile.mode);
            setNights(profile.nights);
            setUseProfileInfo(profile.useProfileInfo);

            if (profile.departurePoint) {
                const parts = profile.departurePoint.split(' ');
                if (parts.length >= 2) {
                    setDeparturePrefecture(parts[0]);
                    setDepartureCity(parts[1]);
                } else {
                    setDeparturePrefecture(parts[0]);
                }
            }

            // Split tags into predefined and custom
            const availableModeTags = modeTags[profile.mode] || [];
            const availableTagStrings = availableModeTags.map(t => t.jp);
            const predefined = profile.selectedTags.filter(t => availableTagStrings.includes(t));
            const custom = profile.selectedTags.filter(t => !availableTagStrings.includes(t));
            setSelectedTags(predefined);
            setCustomTags(custom);

            // Expand details if anything is non-default
            if (profile.nights !== 1 || profile.departurePoint || custom.length > 0) {
                setShowDetails(true);
            }
        } else if (user) {
            // Initial load for logged in user
            if (user.address) {
                const parts = user.address.split(' ');
                if (parts.length >= 2) {
                    setDeparturePrefecture(parts[0]);
                    setDepartureCity(parts[1]);
                } else if (parts.length === 1) {
                    setDeparturePrefecture(parts[0]);
                }
            }
        } else {
            setUseProfileInfo(false);
        }
    }, [user, profile]);

    // Track mode changes specifically to clear tags only on intentional change
    const prevModeRef = useRef<string | null>(null);
    useEffect(() => {
        if (selectedMode && prevModeRef.current !== null && prevModeRef.current !== selectedMode) {
            setSelectedTags([]);
            setCustomTags([]);
            setFocusedTagIndex(null);
        }
        prevModeRef.current = selectedMode;
    }, [selectedMode]);

    const handleNext = () => {
        if (selectedMode) {
            const allTags = [...selectedTags, ...customTags];

            // Include hobbies if enabled and available
            if (useProfileInfo && user?.hobbies) {
                const hobbies = user.hobbies.split(/[、,]/).map(h => h.trim()).filter(h => h);
                hobbies.forEach(hobby => {
                    if (!allTags.includes(hobby)) {
                        allTags.push(hobby);
                    }
                });
            }

            let fullDeparture = '';
            if (departurePrefecture) {
                fullDeparture = departurePrefecture;
                if (departureCity) fullDeparture += ` ${departureCity}`;
            }

            const newProfile = {
                mode: selectedMode,
                selectedTags: allTags,
                customAttributes: allTags.join(', '),
                useProfileInfo,
                nights,
                departurePoint: fullDeparture
            };

            setProfile(newProfile);
            // Always clear proposals to force new generation as requested by user
            setProposals([]);
            (window as any)._lastProposalProfileKey = null;
            navigate('/proposal');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                handleNext();
            } else {
                e.preventDefault();
                addCustomTag();
            }
        } else if (e.key === 'Backspace') {
            if (tagInput === '' && customTags.length > 0) {
                if (focusedTagIndex !== null) {
                    removeCustomTag(focusedTagIndex);
                } else {
                    setFocusedTagIndex(customTags.length - 1);
                }
            }
        } else if (e.key === 'ArrowLeft') {
            if (tagInput === '' || (inputRef.current?.selectionStart === 0 && inputRef.current?.selectionEnd === 0)) {
                if (focusedTagIndex === null) {
                    setFocusedTagIndex(customTags.length - 1);
                } else if (focusedTagIndex > 0) {
                    setFocusedTagIndex(focusedTagIndex - 1);
                }
            }
        } else if (e.key === 'ArrowRight') {
            if (focusedTagIndex !== null) {
                if (focusedTagIndex < customTags.length - 1) {
                    setFocusedTagIndex(focusedTagIndex + 1);
                } else {
                    setFocusedTagIndex(null);
                }
            }
        } else if (e.key === 'Delete') {
            if (focusedTagIndex !== null) {
                removeCustomTag(focusedTagIndex);
            }
        }
    };



    return (
        <div className="container" ref={containerRef} style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {t('profile.title')}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    {t('profile.subtitle')}
                </p>

                {/* Mode Selection */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.2rem',
                    marginBottom: '2rem'
                }}>
                    {travelModes.map((mode) => (
                        <div
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: selectedMode === mode.id ? '1px solid var(--color-primary)' : '1px solid var(--color-glass-border)',
                                background: selectedMode === mode.id ? 'rgba(99, 102, 241, 0.1)' : undefined, // Keep dynamic bg for selection state if desired, or move to class
                                transform: selectedMode === mode.id ? 'translateY(-5px)' : 'none',
                                boxShadow: selectedMode === mode.id ? '0 10px 40px rgba(99, 102, 241, 0.2)' : 'none',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{mode.icon}</div>
                            {/* @ts-ignore */}
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{t(mode.titleKey)}</h3>
                            {/* @ts-ignore */}
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{t(mode.descKey)}</p>
                        </div>
                    ))}
                </div>

                {selectedMode && (
                    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {/* Adaptive Tags Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('profile.tags.title')}</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
                                {(modeTags[selectedMode] || []).map(tag => (
                                    <button
                                        key={tag.jp}
                                        onClick={() => toggleTag(tag.jp)}
                                        className={`tag-button ${selectedTags.includes(tag.jp) ? 'selected' : ''}`}
                                    >
                                        {language === 'en' ? tag.en : tag.jp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Expandable Detailed Conditions */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div
                                onClick={() => setShowDetails(!showDetails)}
                                className="glass-panel-interactive"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    padding: '1rem',
                                    borderRadius: '15px',
                                    marginBottom: showDetails ? '1.5rem' : '0',
                                    background: showDetails ? 'rgba(255,255,255,0.1)' : undefined
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{t('profile.info.details_btn')}</span>
                                <span style={{
                                    fontSize: '0.8rem',
                                    transition: 'transform 0.3s ease',
                                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}>▼</span>
                            </div>

                            {showDetails && (
                                <div className="glass-panel animate-scale-in" style={{ padding: '2rem', border: '1px solid var(--color-glass-border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {/* Custom Attributes Section */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t('profile.attributes.title')}</label>
                                            <div
                                                onClick={() => inputRef.current?.focus()}
                                                className="custom-tags-container"
                                            >
                                                {customTags.map((tag, index) => (
                                                    <span key={index} style={{
                                                        background: focusedTagIndex === index ? 'var(--color-accent)' : 'var(--color-primary)',
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '15px',
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        transition: 'all 0.2s',
                                                        color: 'white'
                                                    }}>
                                                        {tag}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeCustomTag(index); }}
                                                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, fontSize: '0.9rem' }}
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
                                                    onBlur={() => addCustomTag()}
                                                    placeholder={customTags.length === 0 ? t('profile.attributes.placeholder') : ''}
                                                    className="custom-tags-input"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ height: '1px', background: 'var(--color-glass-border)', width: '100%' }}></div>

                                        {/* Profile Usage Toggle */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: user ? 1 : 0.6 }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{t('profile.info.toggle')}</span>
                                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={useProfileInfo}
                                                    disabled={!user}
                                                    onChange={(e) => setUseProfileInfo(e.target.checked)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    cursor: user ? 'pointer' : 'not-allowed',
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
                                                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: '500' }}>{t('profile.info.nights')}</label>
                                                <select
                                                    value={nights}
                                                    onChange={(e) => setNights(Number(e.target.value))}
                                                    className="modern-select"
                                                >
                                                    <option value={0}>{t('profile.info.day_trip')}</option>
                                                    {[...Array(10)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {i + 1} {t('profile.info.nights_unit')}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Departure Point Dropdown */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: '500' }}>{t('profile.info.departure')}</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                                    <select
                                                        value={departurePrefecture}
                                                        onChange={(e) => {
                                                            setDeparturePrefecture(e.target.value);
                                                            setDepartureCity('');
                                                        }}
                                                        className="modern-select"
                                                    >
                                                        <option value="">{t('register.placeholder.address_pref')}</option>
                                                        {regionGroups.map(group => (
                                                            <optgroup key={group.region.jp} label={language === 'en' ? group.region.en : group.region.jp} style={{ color: 'var(--color-primary)' }}>
                                                                {group.prefectures.map(pref => (
                                                                    <option key={pref.jp} value={pref.jp}>{language === 'en' ? pref.en : pref.jp}</option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={departureCity}
                                                        onChange={(e) => setDepartureCity(e.target.value)}
                                                        disabled={!departurePrefecture}
                                                        className="modern-select"
                                                    >
                                                        <option value="">{t('register.placeholder.address_city')}</option>
                                                        {departurePrefecture && citiesByPrefecture[departurePrefecture]?.map(city => (
                                                            <option key={city.jp} value={city.jp}>{language === 'en' ? city.en : city.jp}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: '1.2rem 5rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '50px',
                                    background: 'var(--gradient-brand)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.5)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.4)';
                                }}
                            >
                                {t('profile.btn')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSelection;
