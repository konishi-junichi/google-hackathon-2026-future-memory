import React, { useEffect, useState, useRef } from 'react';
import { GeminiService } from '../services/gemini';

// NOTE: Using Backend API to proxy Google Places API (New)
// Backend stores the API Key.

interface PlaceImageProps {
    query: string;
    width?: string;
    height?: string;
    className?: string;
    borderRadius?: string;
}

// Global cache to prevent multiple requests for the same query during session
const imageCache: Record<string, string> = {};

const PlaceImage: React.FC<PlaceImageProps> = ({
    query,
    width = '100%',
    height = '200px',
    className,
    borderRadius = '10px'
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        let isMounted = true;

        if (!query) {
            setLoading(false);
            return;
        }

        // Check cache first
        if (imageCache[query]) {
            setImageUrl(imageCache[query]);
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            try {
                const data = await GeminiService.getPlacePhoto(query);

                if (isMounted) {
                    if (data.image_url) {
                        imageCache[query] = data.image_url;
                        setImageUrl(data.image_url);
                        setLoading(false);
                    } else {
                        console.log(`No image found via backend for: ${query}`);
                        setError(true);
                        setLoading(false);
                    }
                }
            } catch (e) {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
        };
    }, [query]);

    if (loading) {
        return (
            <div style={{ width, height, background: 'rgba(255,255,255,0.1)', borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
                <span style={{ fontSize: '2rem' }} className="animate-spin">⌛</span>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div style={{ width, height, background: 'rgba(255,255,255,0.05)', borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }} className={className}>
                <span>No Image ({query})</span>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={imageUrl}
            alt={query}
            style={{ width, height, objectFit: 'cover', borderRadius }}
            className={className}
            onError={() => setError(true)}
        />
    );
};

export default PlaceImage;
