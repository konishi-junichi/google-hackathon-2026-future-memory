import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { type SocialPlan, useTravel } from '../context/TravelContext';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/gemini';
import { regionGroups, citiesByPrefecture, getPlaceholderImage } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const Account: React.FC = () => {
    const { t, language } = useTravel();
    const { user, token, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'shared' | 'mylist'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [myList, setMyList] = useState<SocialPlan[]>([]);
    const [sharedPlans, setSharedPlans] = useState<SocialPlan[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        display_name: '',
        age: '',
        gender: '',
        address: '',
        indoor_outdoor: '',
    });
    const [hobbiesTags, setHobbiesTags] = useState<string[]>([]);
    const [hobbyInput, setHobbyInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedPrefecture, setSelectedPrefecture] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        if (activeTab === 'mylist') {
            const fetchFavorites = async () => {
                setIsFetching(true);
                try {
                    const favorites = await GeminiService.getFavorites();
                    setMyList(favorites);
                } finally {
                    setIsFetching(false);
                }
            };
            fetchFavorites();
        } else if (activeTab === 'shared') {
            const fetchShared = async () => {
                setIsFetching(true);
                try {
                    const shared = await GeminiService.getMySharedPlans();
                    setSharedPlans(shared);
                } finally {
                    setIsFetching(false);
                }
            };
            fetchShared();
        }
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            setFormData({
                display_name: user.display_name || '',
                age: user.age?.toString() || '',
                gender: user.gender || '',
                address: user.address || '',
                indoor_outdoor: user.indoor_outdoor || '',
            });

            if (user.address) {
                const parts = user.address.split(' ');
                if (parts.length >= 2) {
                    setSelectedPrefecture(parts[0]);
                    setSelectedCity(parts[1]);
                } else if (parts.length === 1) {
                    setSelectedPrefecture(parts[0]);
                    setSelectedCity('');
                }
            } else {
                setSelectedPrefecture('');
                setSelectedCity('');
            }

            if (user.hobbies) {
                setHobbiesTags(user.hobbies.split(',').map(s => s.trim()).filter(s => s));
            } else {
                setHobbiesTags([]);
            }

            setPreviewUrl(user.profile_image_url);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const addTag = () => {
        const val = hobbyInput.trim();
        if (val && !hobbiesTags.includes(val)) {
            setHobbiesTags([...hobbiesTags, val]);
            setHobbyInput('');
        }
    };

    const removeTag = (index: number) => {
        const newTags = [...hobbiesTags];
        newTags.splice(index, 1);
        setHobbiesTags(newTags);
    };

    const handleHobbyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && hobbyInput === '' && hobbiesTags.length > 0) {
            removeTag(hobbiesTags.length - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('display_name', formData.display_name);
            if (formData.age) formDataToSend.append('age', formData.age);
            if (formData.gender) formDataToSend.append('gender', formData.gender);

            let fullAddress = '';
            if (selectedPrefecture) {
                fullAddress += selectedPrefecture;
                if (selectedCity) {
                    fullAddress += ` ${selectedCity}`;
                }
            }
            if (fullAddress) formDataToSend.append('address', fullAddress);
            else formDataToSend.append('address', '');

            if (formData.indoor_outdoor) formDataToSend.append('indoor_outdoor', formData.indoor_outdoor);

            const hobbiesString = hobbiesTags.join(',');
            formDataToSend.append('hobbies', hobbiesString);

            if (selectedFile) formDataToSend.append('file', selectedFile);

            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedUser = await response.json();
            updateProfile(updatedUser);
            setIsEditing(false);
            setMessage({ type: 'success', text: t('account.update_success') });
        } catch (error) {
            setMessage({ type: 'error', text: t('account.update_error') });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="container" style={{ padding: '4rem' }}>{t('login.loading')}</div>;

    const API_HOST = API_BASE_URL.replace('/api/v1', '');

    const getImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `${API_HOST}${url}`;
    };

    const displayImage = previewUrl ? getImageUrl(previewUrl) : null;

    return (
        <div className="container" style={{ padding: '8rem 1rem 4rem', maxWidth: '800px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="text-gradient" style={{ fontSize: '2rem' }}>{t('account.tab.profile')}</h2>
                    <button onClick={handleLogout} style={{ background: 'transparent', color: '#ec4899', border: '1px solid #ec4899', padding: '8px 16px', borderRadius: '20px' }}>
                        {t('account.logout')}
                    </button>
                </div>

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: message.type === 'success' ? '#34d399' : '#f87171'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid var(--color-primary)',
                            background: '#1e293b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {displayImage ? (
                                <img src={displayImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem' }}>👤</span>
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.display_name || user.username}</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>@{user.username}</p>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '8px 20px',
                                        background: 'var(--color-glass-shine)',
                                        color: 'var(--color-text-main)',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {t('account.edit_btn')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-glass-border)', marginBottom: '1rem' }}>
                        <button
                            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: activeTab === 'profile' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: activeTab === 'profile' ? 'white' : 'var(--color-text-main)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {t('account.tab.profile')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shared')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: activeTab === 'shared' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: activeTab === 'shared' ? 'white' : 'var(--color-text-main)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {t('account.tab.shared')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'mylist' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mylist')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: activeTab === 'mylist' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: activeTab === 'mylist' ? 'white' : 'var(--color-text-main)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {t('account.tab.mylist')}
                        </button>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
                        {activeTab === 'mylist' && (
                            <div className="animate-fade-in">
                                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '0.5rem' }}>
                                    {t('account.mylist.title')}
                                </h3>
                                {isFetching ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
                                        <div className="loader"></div>
                                        <p style={{ color: 'var(--color-text-muted)' }}>{t('social.searching')}</p>
                                    </div>
                                ) : myList.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                                        {t('account.no_mylist')}
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {myList.map((plan) => (
                                            <div key={plan.plan_id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '10px',
                                                transition: 'transform 0.2s'
                                            }}
                                            >
                                                <div
                                                    style={{ display: 'flex', flex: 1, gap: '1rem', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/itinerary?plan_id=${plan.plan_id}`)}
                                                >
                                                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                        <img
                                                            src={(plan.thumbnail && plan.thumbnail !== "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e") ? plan.thumbnail : getPlaceholderImage(plan.plan_id)}
                                                            alt={plan.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{plan.title}</h4>
                                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {plan.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(t('account.delete_confirm'))) {
                                                            try {
                                                                await GeminiService.deleteFavorite(plan.plan_id);
                                                                setMyList(myList.filter(p => p.plan_id !== plan.plan_id));
                                                            } catch (err) {
                                                                alert(t('itinerary.save_error'));
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#f87171',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '50%',
                                                        width: '36px',
                                                        height: '36px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="animate-fade-in">
                                {isEditing ? (
                                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>{t('account.profile_image')}</label>
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ color: 'var(--color-text-main)' }} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label className="label">{t('register.display_name')}</label>
                                            <input className="input-field" name="display_name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} />
                                        </div>

                                        <div>
                                            <label className="label">{t('register.age')}</label>
                                            <input className="input-field" type="number" name="age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">{t('register.gender')}</label>
                                            <select className="input-field" name="gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={{ height: '46px' }}>
                                                <option value="">{t('register.placeholder.gender')}</option>
                                                <option value="male">{t('account.gender.male')}</option>
                                                <option value="female">{t('account.gender.female')}</option>
                                                <option value="other">{t('account.gender.other')}</option>
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label className="label">{t('register.address')}</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <select
                                                    className="input-field"
                                                    name="prefecture"
                                                    value={selectedPrefecture}
                                                    onChange={(e) => {
                                                        const pref = e.target.value;
                                                        setSelectedPrefecture(pref);
                                                        setSelectedCity('');
                                                        setFormData({ ...formData, address: pref });
                                                    }}
                                                    style={{ height: '46px' }}
                                                >
                                                    <option value="">{t('register.placeholder.address_pref')}</option>
                                                    {regionGroups.map(group => (
                                                        <optgroup key={group.region.jp} label={language === 'en' ? group.region.en : group.region.jp} style={{ background: 'var(--color-bg-glass)', color: 'var(--color-primary)' }}>
                                                            {group.prefectures.map(pref => (
                                                                <option key={pref.jp} value={pref.jp}>{language === 'en' ? pref.en : pref.jp}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                                <select
                                                    className="input-field"
                                                    name="city"
                                                    value={selectedCity}
                                                    onChange={(e) => {
                                                        const city = e.target.value;
                                                        setSelectedCity(city);
                                                        setFormData({ ...formData, address: `${selectedPrefecture} ${city}` });
                                                    }}
                                                    style={{ height: '46px' }}
                                                    disabled={!selectedPrefecture}
                                                >
                                                    <option value="">{t('register.placeholder.address_city')}</option>
                                                    {selectedPrefecture && citiesByPrefecture[selectedPrefecture]?.map(city => (
                                                        <option key={city.jp} value={city.jp}>{language === 'en' ? city.en : city.jp}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">{t('register.indoor_outdoor')}</label>
                                            <select className="input-field" name="indoor_outdoor" value={formData.indoor_outdoor} onChange={(e) => setFormData({ ...formData, indoor_outdoor: e.target.value })} style={{ height: '46px' }}>
                                                <option value="">{t('register.placeholder.indoor_outdoor')}</option>
                                                <option value="indoor">{t('account.type.indoor')}</option>
                                                <option value="outdoor">{t('account.type.outdoor')}</option>
                                                <option value="both">{t('account.type.both')}</option>
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label className="label">{t('register.hobbies')}</label>
                                            <div style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--color-glass-border)',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '0.5rem',
                                                alignItems: 'center'
                                            }}>
                                                {hobbiesTags.map((tag, index) => (
                                                    <span key={index} style={{
                                                        background: 'var(--color-primary)',
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem'
                                                    }}>
                                                        {tag}
                                                        <button type="button" onClick={() => removeTag(index)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                                                    </span>
                                                ))}
                                                <input
                                                    type="text"
                                                    value={hobbyInput}
                                                    onChange={(e) => setHobbyInput(e.target.value)}
                                                    onKeyDown={handleHobbyKeyDown}
                                                    onBlur={() => addTag()}
                                                    placeholder={hobbiesTags.length === 0 ? t('register.placeholder.hobbies') : ""}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        outline: 'none',
                                                        color: 'var(--color-text-main)',
                                                        flex: 1,
                                                        minWidth: '120px',
                                                        padding: '4px'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button type="submit" disabled={isLoading} className="btn-primary">
                                                {isLoading ? t('account.saving') : t('account.save_btn')}
                                            </button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                                                {t('account.cancel_btn')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem 2rem', marginTop: '1rem' }}>
                                        <div className="label">{t('register.age')}</div>
                                        <div>{user.age || '-'}</div>

                                        <div className="label">{t('register.gender')}</div>
                                        <div>{user.gender === 'male' ? t('account.gender.male') : user.gender === 'female' ? t('account.gender.female') : user.gender === 'other' ? t('account.gender.other') : user.gender || '-'}</div>

                                        <div className="label">{t('register.address')}</div>
                                        <div>{user.address || '-'}</div>

                                        <div className="label">{t('register.indoor_outdoor')}</div>
                                        <div>{user.indoor_outdoor === 'indoor' ? t('account.type.indoor') : user.indoor_outdoor === 'outdoor' ? t('account.type.outdoor') : user.indoor_outdoor === 'both' ? t('account.type.both') : '-'}</div>

                                        <div className="label">{t('register.hobbies')}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {(user.hobbies ? user.hobbies.split(',') : []).map((tag, i) => (
                                                <span key={i} style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {!user.hobbies && '-'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'shared' && (
                            <div className="animate-fade-in">
                                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '0.5rem' }}>
                                    {t('account.shared.title')}
                                </h3>
                                {isFetching ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
                                        <div className="loader"></div>
                                        <p style={{ color: 'var(--color-text-muted)' }}>{t('social.searching')}</p>
                                    </div>
                                ) : sharedPlans.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                                        {t('account.no_shared')}
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {sharedPlans.map((plan) => (
                                            <div key={plan.plan_id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '10px',
                                                transition: 'transform 0.2s'
                                            }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div
                                                    style={{ display: 'flex', flex: 1, gap: '1rem', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/itinerary?plan_id=${plan.plan_id}`)}
                                                >
                                                    <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                        <img
                                                            src={(plan.thumbnail && plan.thumbnail !== "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e") ? plan.thumbnail : getPlaceholderImage(plan.plan_id)}
                                                            alt={plan.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{plan.title}</h4>
                                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {plan.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(t('account.delete_shared_confirm'))) {
                                                            try {
                                                                await GeminiService.deleteSharedPlan(plan.plan_id);
                                                                setSharedPlans(sharedPlans.filter(p => p.plan_id !== plan.plan_id));
                                                            } catch (err) {
                                                                alert(t('itinerary.save_error'));
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#f87171',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '50%',
                                                        width: '36px',
                                                        height: '36px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    .label { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 0.5rem; display: block; }
                    .input-field {
                        width: 100%;
                        padding: 12px;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid var(--color-glass-border);
                        borderRadius: 8px;
                        color: var(--color-text-main);
                        outline: none;
                    }
                    .btn-primary {
                        padding: 10px 24px;
                        background: var(--gradient-brand);
                        border: none;
                        border-radius: 20px;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .btn-secondary {
                        padding: 10px 24px;
                        background: transparent;
                        border: 1px solid var(--color-glass-border);
                        border-radius: 20px;
                        color: var(--color-text-main);
                        cursor: pointer;
                    }
                    option { background: var(--color-bg-glass); color: var(--color-text-main); }
                    .tab-btn {
                        font-weight: bold;
                    }
                `}</style>
            </div>
        </div >
    );
};

export default Account;
