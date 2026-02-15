import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTravel } from '../context/TravelContext';
import { regionGroups, citiesByPrefecture } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t, language } = useTravel();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        display_name: '',
        age: '',
        gender: '',
        address: '',
        indoor_outdoor: '',
    });
    const [hobbyInput, setHobbyInput] = useState('');
    const [hobbiesTags, setHobbiesTags] = useState<string[]>([]);
    const [selectedPrefecture, setSelectedPrefecture] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pref = e.target.value;
        setSelectedPrefecture(pref);
        setSelectedCity('');
        setFormData(prev => ({ ...prev, address: pref }));
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value;
        setSelectedCity(city);
        setFormData(prev => ({ ...prev, address: `${selectedPrefecture} ${city} ` }));
    };

    // Tag Logic for Hobbies
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
        setError('');
        setIsLoading(true);

        try {
            // Join tags into a single string
            const hobbiesString = hobbiesTags.join(',');

            // 1. Register
            const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    age: formData.age ? parseInt(formData.age) : null,
                    hobbies: hobbiesString
                }),
            });

            if (!registerResponse.ok) {
                const data = await registerResponse.json();
                throw new Error(data.detail || t('register.error.failed'));
            }

            // 2. Auto Login
            const params = new URLSearchParams();
            params.append('username', formData.username);
            params.append('password', formData.password);

            const loginResponse = await fetch(`${API_BASE_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                await login(loginData.access_token);
                navigate('/');
            } else {
                navigate('/login');
            }

        } catch (err: any) {
            setError(err.message || t('register.error.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '8rem 1rem 4rem', maxWidth: '600px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>{t('register.title')}</h2>
                {error && <div style={{ color: '#ec4899', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.username')}</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required className="modern-input" placeholder={t('register.placeholder.username')} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.password')}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="modern-input" />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.display_name')}</label>
                        <input type="text" name="display_name" value={formData.display_name} onChange={handleChange} className="modern-input" placeholder={t('register.placeholder.display_name')} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.age')}</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="modern-input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.gender')}</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="modern-select">
                            <option value="">{t('register.placeholder.gender')}</option>
                            <option value="male">{t('account.gender.male')}</option>
                            <option value="female">{t('account.gender.female')}</option>
                            <option value="other">{t('account.gender.other')}</option>
                            <option value="no_answer">{t('account.gender.no_answer')}</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.address')}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <select
                                name="prefecture"
                                value={selectedPrefecture}
                                onChange={handlePrefectureChange}
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
                                name="city"
                                value={selectedCity}
                                onChange={handleCityChange}
                                className="modern-select"
                                disabled={!selectedPrefecture}
                            >
                                <option value="">{t('register.placeholder.address_city')}</option>
                                {selectedPrefecture && citiesByPrefecture[selectedPrefecture]?.map(city => (
                                    <option key={city.jp} value={city.jp}>{language === 'en' ? city.en : city.jp}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{t('register.indoor_outdoor')}</label>
                        <select name="indoor_outdoor" value={formData.indoor_outdoor} onChange={handleChange} className="modern-select">
                            <option value="">{t('register.placeholder.indoor_outdoor')}</option>
                            <option value="indoor">{t('account.type.indoor')}</option>
                            <option value="outdoor">{t('account.type.outdoor')}</option>
                            <option value="both">{t('account.type.both')}</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('register.hobbies')}</label>

                        <div className="custom-tags-container"
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-glass-border)'}
                        >
                            {hobbiesTags.map((tag, index) => (
                                <span key={index} style={{
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '15px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}>
                                    {tag}
                                    <button type="button" onClick={() => removeTag(index)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                                    >×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={hobbyInput}
                                onChange={(e) => setHobbyInput(e.target.value)}
                                onKeyDown={handleHobbyKeyDown}
                                placeholder={hobbiesTags.length === 0 ? t('register.placeholder.hobbies') : ""}
                                className="custom-tags-input"
                            />
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'var(--gradient-brand)',
                                border: 'none',
                                borderRadius: '30px',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '1.05rem',
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
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
                            {isLoading ? t('register.loading') : t('register.btn')}
                        </button>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                            {t('register.have_account')} <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>{t('register.login_link')}</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
