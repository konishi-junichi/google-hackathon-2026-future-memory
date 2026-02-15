import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstagramEmbed, TikTokEmbed, YouTubeEmbed } from 'react-social-media-embed';
import { useTravel } from '../context/TravelContext';
import { useAuth } from '../context/AuthContext';
import { GeminiService } from '../services/gemini';

const VideoPreview: React.FC = () => {
    const navigate = useNavigate();
    const { selectedProposal, t, videoCache, setVideoCache } = useTravel();
    const { user, isLoading: isAuthLoading } = useAuth();

    // Separate loading states
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isShortsLoading, setIsShortsLoading] = useState(false);
    const [isAiVideoLoading, setIsAiVideoLoading] = useState(false);

    // Error states
    const [imageError, setImageError] = useState('');
    const [videoError, setVideoError] = useState('');

    // Refs for deduplication
    const imageRequestRef = React.useRef<string | null>(null);
    const shortsRequestRef = React.useRef<string | null>(null);
    const aiVideoRequestRef = React.useRef<string | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedProposal) {
            navigate('/proposal');
            return;
        }

        if (isAuthLoading) return;

        const currentProposalId = String(selectedProposal.id);
        const cacheItem = videoCache[selectedProposal.id] || {};

        // --- 1. Fetch Generated Images (Logged in users only) ---
        // Check if we have images (array)
        const hasImages = cacheItem.generatedImageUrls && cacheItem.generatedImageUrls.length > 0;

        if (user && !hasImages && imageRequestRef.current !== currentProposalId) {
            imageRequestRef.current = currentProposalId;
            setIsImageLoading(true);
            GeminiService.generateImage(
                selectedProposal.id,
                selectedProposal.title,
                selectedProposal.desc,
                user?.profile_image_url,
                user?.id
            ).then(imageUrls => {
                if (imageUrls && imageUrls.length > 0) {
                    setVideoCache(prev => ({
                        ...prev,
                        [selectedProposal.id]: {
                            ...prev[selectedProposal.id],
                            videoUrls: prev[selectedProposal.id]?.videoUrls || [], // Ensure videoUrls exists 
                            generatedImageUrls: imageUrls
                        }
                    }));
                }
            }).catch(() => {
                setImageError(t('preview.pictures.error.failed'));
            }).finally(() => setIsImageLoading(false));
        }

        // --- 2. Fetch Short Videos ---
        if ((!cacheItem.videoUrls || cacheItem.videoUrls.length === 0) && shortsRequestRef.current !== currentProposalId) {
            shortsRequestRef.current = currentProposalId;
            setIsShortsLoading(true);
            GeminiService.searchShortVideos(
                selectedProposal.id,
                selectedProposal.title,
                selectedProposal.desc
            ).then(urls => {
                if (urls && urls.length > 0) {
                    setVideoCache(prev => ({
                        ...prev,
                        [selectedProposal.id]: {
                            ...prev[selectedProposal.id],
                            videoUrls: urls,
                            generatedImageUrls: prev[selectedProposal.id]?.generatedImageUrls // Preserve images
                        }
                    }));
                }
            }).finally(() => setIsShortsLoading(false));
        }

        // --- 3. Fetch AI Video (Logged in users only) ---
        if (user && !cacheItem.generatedVideoUrl && aiVideoRequestRef.current !== currentProposalId) {
            aiVideoRequestRef.current = currentProposalId;
            setIsAiVideoLoading(true);
            GeminiService.generateAiVideo(
                selectedProposal.id,
                selectedProposal.title,
                selectedProposal.desc,
                user.profile_image_url,
                user.id
            ).then(videoUrl => {
                if (videoUrl) {
                    setVideoCache(prev => ({
                        ...prev,
                        [selectedProposal.id]: {
                            ...prev[selectedProposal.id],
                            videoUrls: prev[selectedProposal.id]?.videoUrls || [],
                            generatedImageUrls: prev[selectedProposal.id]?.generatedImageUrls,
                            generatedVideoUrl: videoUrl
                        }
                    }));
                }
            }).catch(() => {
                setVideoError(t('preview.video.error.failed'));
            }).finally(() => setIsAiVideoLoading(false));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProposal, navigate, user, isAuthLoading]);

    const videoUrls = selectedProposal ? (videoCache[selectedProposal.id]?.videoUrls || []) : [];
    const generatedImageUrls = selectedProposal ? (videoCache[selectedProposal.id]?.generatedImageUrls || []) : [];
    const generatedVideoUrl = selectedProposal ? (videoCache[selectedProposal.id]?.generatedVideoUrl || null) : null;


    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const amount = 280; // Card width (260) + gap (20)
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth'
            });
        }
    };

    const scrollImages = (direction: 'left' | 'right') => {
        const container = document.getElementById('image-scroll-container');
        if (container) {
            const amount = 260;
            container.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth'
            });
        }
    };

    const handleGenerateImage = async () => {
        if (!user || !selectedProposal) return;

        setIsImageLoading(true);
        setImageError('');
        try {
            const urls = await GeminiService.generateImage(
                selectedProposal.id,
                selectedProposal.title,
                selectedProposal.desc,
                user.profile_image_url,
                user.id
            );
            if (urls && urls.length > 0) {
                setVideoCache(prev => ({
                    ...prev,
                    [selectedProposal.id]: {
                        ...prev[selectedProposal.id],
                        videoUrls: prev[selectedProposal.id]?.videoUrls || [],
                        generatedImageUrls: urls
                    }
                }));
            } else {
                setImageError(t('preview.pictures.error.failed'));
            }
        } catch (e) {
            setImageError(t('preview.pictures.error.general'));
        } finally {
            setIsImageLoading(false);
        }
    };

    const handleGenerateAiVideo = async () => {
        if (!user || !selectedProposal) return;
        setIsAiVideoLoading(true);
        setVideoError('');
        try {
            const url = await GeminiService.generateAiVideo(
                selectedProposal.id,
                selectedProposal.title,
                selectedProposal.desc,
                user.profile_image_url,
                user.id
            );
            if (url) {
                setVideoCache(prev => ({
                    ...prev,
                    [selectedProposal.id]: {
                        ...prev[selectedProposal.id],
                        videoUrls: prev[selectedProposal.id]?.videoUrls || [],
                        generatedImageUrls: prev[selectedProposal.id]?.generatedImageUrls,
                        generatedVideoUrl: url
                    }
                }));
            } else {
                setVideoError(t('preview.video.error.failed'));
            }
        } catch (e) {
            setVideoError(t('preview.video.error.general'));
        } finally {
            setIsAiVideoLoading(false);
        }
    };

    if (!selectedProposal) return null;

    // Helper for section headers
    const SectionHeader = ({ title }: { title: string }) => (
        <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: 'var(--color-text-main)',
            borderLeft: '4px solid var(--color-primary)',
            paddingLeft: '12px'
        }}>
            {title}
        </h3>
    );

    // Helper for loading placeholder
    const LoadingPlaceholder = ({ height, text }: { height: string, text: string }) => (
        <div style={{
            width: '100%',
            height,
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-glass-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <div className="loader"></div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{text}</p>
        </div>
    );

    return (
        <div className="container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--color-text-main)',
            paddingTop: '6rem', // Reduced padding
            paddingBottom: '4rem',
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'var(--color-bg-dark)'
        }}>
            {/* Local Navigation Area */}
            <div className="animate-fade-in" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <button
                    onClick={() => navigate('/proposal')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-glass-border)',
                        color: 'var(--color-text-main)',
                        padding: '10px 24px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>←</span> {t('preview.back')}
                </button>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }} className="text-gradient">
                        {selectedProposal.title}
                    </h2>
                </div>
            </div>

            {/* 1. Top Section: Reference Shorts (Horizontal Scroll) */}
            <div style={{ position: 'relative', marginBottom: '3rem' }}>
                <SectionHeader title={t('preview.shorts.title')} />

                {/* Scroll Buttons */}
                {videoUrls.length > 0 && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            style={{
                                position: 'absolute',
                                left: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 100,
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--color-text-main)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            style={{
                                position: 'absolute',
                                right: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 100,
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--color-text-main)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            ›
                        </button>
                    </>
                )}

                <div
                    ref={scrollContainerRef}
                    style={{
                        flex: 1,
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        gap: '20px',
                        padding: '10px 0 20px 0',
                        minHeight: '540px'
                    }} className="custom-scrollbar">

                    {/* Loading State for Shorts */}
                    {isShortsLoading && videoUrls.length === 0 && (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <LoadingPlaceholder height="460px" text={t('preview.shorts.loading')} />
                        </div>
                    )}

                    {/* Empty State for Shorts */}
                    {!isShortsLoading && videoUrls.length === 0 && (
                        <div style={{ width: '100%', textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                            {t('preview.shorts.empty')}
                        </div>
                    )}

                    {/* Video Cards */}
                    {videoUrls.map((url: string, index: number) => {
                        const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
                        const isInstagram = url.includes('instagram.com');
                        const isTiktok = url.includes('tiktok.com');
                        let platformLabel = "Video";
                        let platformColor = "#666";

                        if (isYoutube) { platformLabel = "YouTube"; platformColor = "#FF0000"; }
                        else if (isInstagram) { platformLabel = "Instagram"; platformColor = "#E1306C"; }
                        else if (isTiktok) { platformLabel = "TikTok"; platformColor = "#000000"; }

                        return (
                            <div key={index} style={{
                                width: '260px',
                                aspectRatio: '9/16', // Smartphone aspect ratio
                                minWidth: '260px',
                                scrollSnapAlign: 'start',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.5)',
                                background: 'black', // Dark background for video container
                                border: '1px solid var(--color-glass-border)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    zIndex: 10,
                                    background: platformColor,
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {platformLabel}
                                </div>

                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'hidden',
                                    background: 'black',
                                    position: 'relative'
                                }}>
                                    {isYoutube ? (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <YouTubeEmbed url={url} width={260} />
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '330px', // Satisfy minimum width requirements (Insta: ~326px)
                                            transform: 'scale(0.788)', // Scale down to match 260px container (260/330)
                                            transformOrigin: 'top left',
                                            height: '100%' // Ensure height is passed
                                        }}>
                                            {isInstagram ? <InstagramEmbed url={url} width={330} /> :
                                                isTiktok ? <TikTokEmbed url={url} width={330} /> : null}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* 2. Bottom Section: Split View (Pictures & Video) */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Left: Generated Images (Carousel) */}
                <div style={{ flex: 1.5, minWidth: '300px', position: 'relative' }}>
                    <SectionHeader title={t('preview.pictures.title')} />

                    {!user ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            border: '1px solid var(--color-glass-border)',
                            color: '#ccc'
                        }}>
                            <p>{t('preview.pictures.login_required')}</p>
                        </div>
                    ) : (
                        <>
                            {generatedImageUrls.length > 0 && (
                                <>
                                    <button onClick={() => scrollImages('left')} style={{
                                        position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                                        width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', zIndex: 10,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>‹</button>
                                    <button onClick={() => scrollImages('right')} style={{
                                        position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                                        width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', zIndex: 10,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>›</button>
                                </>
                            )}

                            <div id="image-scroll-container" style={{
                                display: 'flex',
                                overflowX: 'auto',
                                scrollSnapType: 'x mandatory',
                                gap: '15px',
                                paddingBottom: '10px',
                                scrollbarWidth: 'none',
                            }} className="custom-scrollbar">
                                {generatedImageUrls.length > 0 ? (
                                    generatedImageUrls.map((imgUrl, idx) => (
                                        <div key={idx} style={{
                                            minWidth: '240px',
                                            maxWidth: '240px',
                                            aspectRatio: '9/16',
                                            scrollSnapAlign: 'start',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                            position: 'relative'
                                        }}>
                                            <img src={imgUrl} alt={`Generated ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <a href={imgUrl} target="_blank" rel="noreferrer" style={{
                                                position: 'absolute', bottom: '10px', right: '10px',
                                                background: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px 10px',
                                                borderRadius: '20px', textDecoration: 'none', fontSize: '0.8rem'
                                            }}>Download</a>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        {isImageLoading ? (
                                            <LoadingPlaceholder height="426px" text={t('preview.pictures.loading')} />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '426px', // 240 * 16/9
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '16px',
                                                border: '2px dashed var(--color-glass-border)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }} onClick={() => handleGenerateImage()}>
                                                <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</span>
                                                <p style={{ color: '#aaa' }}>{t('preview.pictures.generate_btn')}</p>
                                                {imageError && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>{imageError}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right: AI Generated Video (9:16) */}
                <div style={{ flex: 1, minWidth: '240px', maxWidth: '350px' }}>
                    <SectionHeader title={t('preview.video.title')} />
                    {!user ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            border: '1px solid var(--color-glass-border)',
                            color: '#ccc'
                        }}>
                            <p>{t('preview.video.login_required')}</p>
                        </div>
                    ) : (
                        <div style={{
                            width: '100%',
                            aspectRatio: '9/16',
                            background: 'black',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            border: '1px solid var(--color-glass-border)'
                        }}>
                            {generatedVideoUrl ? (
                                <video
                                    src={generatedVideoUrl}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : isAiVideoLoading ? (
                                <LoadingPlaceholder height="100%" text={t('preview.video.loading')} />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.05)'
                                }} onClick={() => handleGenerateAiVideo()}>
                                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</span>
                                    <p style={{ color: '#aaa' }}>{t('preview.video.generate_btn')}</p>
                                    {videoError && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0 1rem', textAlign: 'center' }}>{videoError}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Area */}
            <div className="animate-fade-in" style={{
                marginTop: '3rem',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid var(--color-glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '2rem'
            }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        opacity: 0.8,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {selectedProposal.desc}
                    </p>
                </div>

                <button
                    onClick={() => navigate('/itinerary')}
                    style={{
                        padding: '1.2rem 3rem',
                        background: 'var(--gradient-brand)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {t('preview.select')}
                </button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px; /* Vertical scrollbar width */
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--color-primary);
                }
                .loader {
                    border: 4px solid rgba(255,255,255,0.1);
                    border-top: 4px solid var(--color-primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
};


export default VideoPreview;
