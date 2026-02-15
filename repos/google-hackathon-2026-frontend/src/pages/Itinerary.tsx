import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { GeminiService } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import PlaceImage from '../components/PlaceImage';
import AIChatPanel from '../components/AIChatPanel';

const Itinerary: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const {
        selectedProposal, setSelectedProposal,
        itinerary, setItinerary,
        t, language, profile
    } = useTravel();
    const [isLoading, setIsLoading] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Helper to generate time options (15 min intervals)
    const generateTimeOptions = () => {
        const times = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 15) {
                const hour = i.toString().padStart(2, '0');
                const minute = j.toString().padStart(2, '0');
                times.push(`${hour}:${minute}`);
            }
        }
        return times;
    };
    const timeOptions = generateTimeOptions();

    const handleUpdateItem = (dayIndex: number, itemIndex: number, field: string, value: any) => {
        if (!itinerary) return;
        const newItinerary = { ...itinerary };
        const day = newItinerary.days.find(d => d.day === dayIndex);
        if (day) {
            day.items[itemIndex] = { ...day.items[itemIndex], [field]: value };
            setItinerary(newItinerary);
        }
    };

    const handleDeleteItem = (dayIndex: number, itemIndex: number) => {
        if (!itinerary) return;
        if (!window.confirm(t('itinerary.delete_confirm'))) return;
        const newItinerary = { ...itinerary };
        const day = newItinerary.days.find(d => d.day === dayIndex);
        if (day) {
            day.items.splice(itemIndex, 1);
            setItinerary(newItinerary);
        }
    };

    const handleAddItem = (dayIndex: number, insertIndex?: number) => {
        if (!itinerary) return;
        const newItinerary = { ...itinerary };
        const day = newItinerary.days.find(d => d.day === dayIndex);
        if (day) {
            // Determine time for new item
            let newTime = "12:00";
            if (insertIndex !== undefined) {
                // Try to take time from prev item or next item
                if (insertIndex > 0 && day.items[insertIndex - 1]) {
                    newTime = day.items[insertIndex - 1].time; // Same as prev for now
                } else if (day.items[insertIndex]) {
                    newTime = day.items[insertIndex].time;
                }
            } else {
                // Append
                if (day.items.length > 0) {
                    // Add 1 hour to last item
                    const lastTime = day.items[day.items.length - 1].time;
                    const [h, m] = lastTime.split(':').map(Number);
                    const newH = (h + 1) % 24;
                    newTime = `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                }
            }

            const newItem = {
                time: newTime,
                activity: t('itinerary.new_activity'),
                description: "",
                icon: "📍"
            };

            if (insertIndex !== undefined) {
                day.items.splice(insertIndex, 0, newItem);
            } else {
                day.items.push(newItem);
            }

            // Only sort if we appended without specific index context, 
            // OR we might want to respect the user's manual insertion point even if time is out of order initially.
            // Let's NOT sort automatically when inserting at a specific index to avoid jumping.
            // But the time picker will eventually restrict them? 
            // For now, let's sort only if we didn't insert at a specific spot, OR just re-sort always?
            // If we re-sort, the item jumping might be confusing. 
            // Let's Try: Sort always, assuming user will adjust time.
            day.items.sort((a, b) => a.time.localeCompare(b.time));

            setItinerary(newItinerary);
        }
    };

    // Auto-save logic could go here if we wanted to persist to backend automatically
    // For now we rely on the manual "Save" button to persist to My List

    useEffect(() => {
        const fetchItinerary = async () => {
            const queryParams = new URLSearchParams(location.search);
            const planId = queryParams.get('plan_id');

            if (planId) {
                // Check if already loaded to prevent infinite loop
                if (itinerary && (itinerary.proposalId === planId || itinerary.proposalId === Number(planId))) {
                    setIsLoading(false);
                    return;
                }

                // Fetch specific plan from Social Mode or My List
                setIsLoading(true);
                try {
                    const plan = await GeminiService.getPlan(planId);
                    if (plan) {
                        // Re-group flat itinerary to Daily format
                        const groupedDays: Record<number, any[]> = {};
                        plan.itinerary.forEach((item: any) => {
                            // Backend format: "Day X 09:00"
                            const dayMatch = item.time.match(/Day (\d+)/);
                            const dayNum = dayMatch ? parseInt(dayMatch[1]) : 1;
                            const timeOnly = item.time.replace(/Day \d+ /, '');

                            if (!groupedDays[dayNum]) groupedDays[dayNum] = [];
                            groupedDays[dayNum].push({
                                time: timeOnly,
                                activity: item.spot_name,
                                description: item.note,
                                icon: '📍', // Generic icon as BQ doesn't store original icons
                                travel_time: item.travel_time, // If exists
                                video_ref: item.ref_video_url ? { url: item.ref_video_url, poi: item.spot_name } : undefined
                            });
                        });

                        const formattedItinerary = {
                            proposalId: plan.plan_id,
                            days: Object.keys(groupedDays).map(d => ({
                                day: parseInt(d),
                                items: groupedDays[parseInt(d)]
                            })).sort((a, b) => a.day - b.day),
                            souvenirs: plan.souvenirs || []
                        };

                        setSelectedProposal({
                            id: plan.plan_id,
                            title: plan.title,
                            desc: plan.description,
                            tagline: '',
                            match: 100,
                            color: 'from-blue-500 to-indigo-600',
                            location: '', // Could be parsed if needed
                            tags: plan.tags,
                            previewVideoUrl: plan.thumbnail
                        });
                        setItinerary(formattedItinerary);
                    } else {
                        navigate('/social');
                    }
                } catch (error) {
                    console.error("Failed to fetch plan detail", error);
                    navigate('/social');
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            if (!selectedProposal) {
                navigate('/proposal');
                return;
            }

            // Skip if already loaded for this proposal and language
            const itineraryKey = `${selectedProposal.id}-${language}`;

            // Check if we are already fetching this exact itinerary
            if ((window as any)._fetchingItineraryKey === itineraryKey) {
                return;
            }

            if (itinerary && itinerary.proposalId === selectedProposal.id && (window as any)._lastItineraryLang === language) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            (window as any)._fetchingItineraryKey = itineraryKey;

            try {
                const nights = profile?.nights ?? 1;
                const data = await GeminiService.generateItinerary(selectedProposal.id, selectedProposal.title, language, nights);
                (window as any)._lastItineraryLang = language;
                setItinerary(data);
            } catch (error) {
                console.error("Failed to generate itinerary", error);
                (window as any)._fetchingItineraryKey = null;
            } finally {
                setIsLoading(false);
                (window as any)._fetchingItineraryKey = null;
            }
        };

        fetchItinerary();
    }, [selectedProposal, navigate, setItinerary, language, location.search, setSelectedProposal]);

    if (isLoading || !itinerary) {
        return (
            <div className="container" style={{
                height: '80vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <div className="animate-glide" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
                <h2 className="text-gradient">{t('itinerary.loading.title')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('itinerary.loading.desc')}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            {/* Global Navigation Area */}
            {/* Global Navigation Area */}
            <div className="animate-fade-in" style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/preview')}
                        className="action-button secondary"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t('preview.back')}
                    </button>

                    <button
                        onClick={async () => {
                            if (!isAuthenticated) {
                                alert(t('itinerary.login_required'));
                                return;
                            }
                            if (!selectedProposal || !itinerary) return;
                            if (!window.confirm(t('itinerary.share_confirm'))) return;
                            setIsSharing(true);
                            try {
                                // Enrich tags
                                const tags = new Set<string>();
                                if (profile?.mode) tags.add(profile.mode);
                                if (profile?.selectedTags) profile.selectedTags.forEach(t => tags.add(t));
                                if (selectedProposal.location) tags.add(selectedProposal.location);
                                if (selectedProposal.tags) selectedProposal.tags.forEach(t => tags.add(t));


                                const planData = {
                                    plan_id: selectedProposal.id, // Send existing ID if available (for update)
                                    title: selectedProposal.title,
                                    description: selectedProposal.desc,
                                    thumbnail: selectedProposal.previewVideoUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
                                    tags: Array.from(tags),
                                    itinerary: itinerary.days,
                                    souvenirs: itinerary.souvenirs,
                                    total_duration_minutes: 0,
                                    target_mode: profile?.mode || "personal"
                                };
                                const result = await GeminiService.sharePlan(planData);

                                if (result.status === "duplicate") {
                                    alert(t('itinerary.share_duplicate'));
                                } else if (result.status === "updated") {
                                    alert(t('itinerary.share_updated'));
                                    if (result.plan_id) {
                                        setItinerary({
                                            ...itinerary,
                                            proposalId: result.plan_id
                                        });
                                        setSelectedProposal({
                                            ...selectedProposal,
                                            id: result.plan_id
                                        });
                                    }
                                } else {
                                    alert(t('itinerary.share_success'));
                                    if (result.plan_id) {
                                        setItinerary({
                                            ...itinerary,
                                            proposalId: result.plan_id
                                        });
                                        setSelectedProposal({
                                            ...selectedProposal,
                                            id: result.plan_id
                                        });
                                    }
                                }
                            } catch (e) {
                                console.error(e);
                                alert(t('itinerary.share_error'));
                            } finally {
                                setIsSharing(false);
                            }
                        }}
                        disabled={isSharing || isSaving}
                        className="action-button primary"
                    >
                        <svg className={isSharing ? 'animate-spin' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {isSharing ? (
                                <>
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
                                </>
                            ) : (
                                <>
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <polyline points="16 6 12 2 8 6" />
                                    <line x1="12" y1="2" x2="12" y2="15" />
                                </>
                            )}
                        </svg>
                        {isSharing ? t('itinerary.sharing') : t('itinerary.share')}
                    </button>

                    <button
                        onClick={async () => {
                            if (!selectedProposal || !itinerary) return;
                            setIsSaving(true);
                            try {
                                // Enrich tags
                                const tags = new Set<string>();
                                if (profile?.mode) tags.add(profile.mode);
                                if (profile?.selectedTags) profile.selectedTags.forEach(t => tags.add(t));
                                if (selectedProposal.location) tags.add(selectedProposal.location);
                                if (selectedProposal.tags) selectedProposal.tags.forEach(t => tags.add(t));

                                const planData = {
                                    plan_id: selectedProposal.id,
                                    title: selectedProposal.title,
                                    description: selectedProposal.desc,
                                    thumbnail: selectedProposal.previewVideoUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
                                    tags: Array.from(tags),
                                    itinerary: itinerary.days,
                                    souvenirs: itinerary.souvenirs,
                                    total_duration_minutes: 0,
                                    target_mode: profile?.mode || "personal"
                                };
                                const result = await GeminiService.addToFavorites(planData);

                                if (result.status === "duplicate") {
                                    alert(t('itinerary.save_duplicate'));
                                } else if (result.status === "updated") {
                                    alert(t('itinerary.save_updated'));
                                    if (result.plan_id) {
                                        setItinerary({
                                            ...itinerary,
                                            proposalId: result.plan_id
                                        });
                                        setSelectedProposal({
                                            ...selectedProposal,
                                            id: result.plan_id
                                        });
                                    }
                                } else {
                                    alert(t('itinerary.save_success'));
                                    if (result.plan_id) {
                                        setItinerary({
                                            ...itinerary,
                                            proposalId: result.plan_id
                                        });
                                        setSelectedProposal({
                                            ...selectedProposal,
                                            id: result.plan_id
                                        });
                                    }
                                }
                            } catch (e: any) {
                                console.error(e);
                                alert(t('itinerary.save_error'));
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={isSharing || isSaving}
                        className="action-button primary"
                        style={{
                            background: isSaving ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                        }}
                    >
                        <svg className={isSaving ? 'animate-spin' : ''} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                            {isSaving ? (
                                <>
                                    <circle cx="12" cy="12" r="3" fill="none" strokeWidth="2" />
                                    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" fill="none" strokeWidth="2" />
                                </>
                            ) : (
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                            )}
                            {!isSaving && <polyline points="17 3 17 8 22 8" fill="none" stroke="currentColor" strokeWidth="1.5" />}
                        </svg>
                        {isSaving ? t('itinerary.saving') : t('itinerary.status.save')}
                    </button>

                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="action-button accent"
                        style={{
                            animation: 'pulse-glow 2s ease-in-out infinite'
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2.5px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(59, 130, 246, 0.3)',
                            flexShrink: 0
                        }}>
                            <img src="/icon.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span>{t('itinerary.concierge')}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="animate-fade-in">
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {t('itinerary.title')}: <span className="text-gradient">{selectedProposal?.title}</span>
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    {t('itinerary.subtitle')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                    {/* Left Column: Timeline */}
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{t('itinerary.schedule')}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`tab-button ${isEditing ? 'active' : ''}`}
                                >
                                    {isEditing ? t('itinerary.edit.done') : `📝 ${t('itinerary.edit.btn')}`}
                                </button>
                                {itinerary.days.length > 1 && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {itinerary.days.map((day) => (
                                            <button
                                                key={day.day}
                                                onClick={() => setSelectedDay(day.day)}
                                                className={`tab-button ${selectedDay === day.day ? 'active' : ''}`}
                                            >
                                                Day {day.day}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </h3>
                        <div style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid var(--color-glass-border)' }}>
                            {itinerary.days.find(d => d.day === selectedDay)?.items.map((item, index) => (
                                <React.Fragment key={index}>
                                    {isEditing && (
                                        <div
                                            onClick={() => handleAddItem(selectedDay, index)}
                                            style={{
                                                height: '20px',
                                                margin: '0.5rem 0',
                                                border: '1px dashed rgba(255,255,255,0.2)',
                                                borderRadius: '5px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                opacity: 0.6,
                                                color: 'var(--color-primary)',
                                                fontSize: '0.8rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.opacity = '0.6';
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            + {t('itinerary.edit.add')}
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '2rem', position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '-1.45rem',
                                            top: '0',
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '50%',
                                            background: 'var(--color-primary)',
                                            boxShadow: '0 0 10px var(--color-primary)'
                                        }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {isEditing ? (
                                                <select
                                                    value={item.time}
                                                    onChange={(e) => handleUpdateItem(selectedDay, index, 'time', e.target.value)}
                                                    className="modern-select"
                                                    style={{ padding: '2px 5px', width: 'auto' }}
                                                >
                                                    {timeOptions.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.time}</span>
                                            )}

                                            {item.travel_time && (
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: 'var(--color-glass-shine)',
                                                    color: 'var(--color-accent)'
                                                }}>
                                                    🚌 {item.travel_time}
                                                </span>
                                            )}
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleDeleteItem(selectedDay, index)}
                                                    style={{
                                                        marginLeft: 'auto',
                                                        background: 'red',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                        <div className="glass-panel" style={{
                                            marginTop: '0.5rem',
                                            padding: '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={item.activity}
                                                        onChange={(e) => handleUpdateItem(selectedDay, index, 'activity', e.target.value)}
                                                        className="modern-input"
                                                        style={{ width: '100%' }}
                                                    />
                                                ) : (
                                                    <span style={{ color: 'var(--color-text-main)' }}>{item.activity}</span>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <textarea
                                                    value={item.description || ''}
                                                    onChange={(e) => handleUpdateItem(selectedDay, index, 'description', e.target.value)}
                                                    className="modern-input"
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '80px',
                                                        marginLeft: '3.5rem',
                                                        maxWidth: 'calc(100% - 3.5rem)'
                                                    }}
                                                />
                                            ) : (
                                                item.description && (
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginLeft: '3.5rem' }}>
                                                        {item.description}
                                                    </p>
                                                )
                                            )}
                                            {/* Place Image for Activity */}
                                            <div style={{ marginLeft: '3.5rem', marginTop: '0.5rem', height: '200px', borderRadius: '10px', overflow: 'hidden' }}>
                                                <PlaceImage
                                                    query={item.video_ref?.poi || item.activity}
                                                    height="100%"
                                                    borderRadius="10px"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                            {isEditing && (
                                <button
                                    onClick={() => handleAddItem(selectedDay)}
                                    style={{
                                        marginTop: '1rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px dashed var(--color-glass-border)',
                                        color: 'var(--color-text-main)',
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    + {t('itinerary.edit.add_end')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Map & Extras */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Map Integration */}
                        {selectedProposal && (
                            <MapComponent
                                query={selectedProposal.location}
                                origin={profile?.departurePoint}
                                destination={selectedProposal.location}
                                waypoints={itinerary?.days.find(d => d.day === selectedDay)?.items
                                    .filter(i => i.location || i.activity)
                                    .map(i => i.activity + (selectedProposal.location ? ` ${selectedProposal.location}` : '')) // Fallback to activity name + region
                                }
                            />
                        )}

                        {/* Souvenir Concierge */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🎁 {t('itinerary.souvenir')}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                {t('itinerary.souvenir.desc')}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {itinerary.souvenirs.map((item, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ marginBottom: '0.5rem', height: '150px', borderRadius: '10px', overflow: 'hidden' }}>
                                            {/* Use item.name + location to search for a more accurate image */}
                                            <PlaceImage
                                                query={`${item.name} ${selectedProposal?.location || ''}`}
                                                height="100%"
                                                borderRadius="10px"
                                            />
                                        </div>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                        <div style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>{item.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <AIChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onUpdateItinerary={(newItinerary) => setItinerary(newItinerary)}
            />
        </div >
    );
};

export default Itinerary;
