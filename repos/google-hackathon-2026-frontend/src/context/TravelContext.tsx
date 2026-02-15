import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '../utils/translations';

// Types
export interface TravelProfile {
    mode: string;
    selectedTags: string[];
    customAttributes: string;
    useProfileInfo: boolean;
    nights: number;
    departurePoint: string;
}

export interface Proposal {
    id: number | string;
    title: string;
    tagline: string;
    desc: string;
    match: number;
    color: string;
    location: string;
    previewVideoUrl?: string; // Placeholder for future
    tags?: string[];
}

export interface Location {
    lat: number;
    lng: number;
}

export interface VideoRef {
    url: string;
    poi: string;
}

export interface ScheduleItem {
    time: string;
    activity: string;
    icon: string;
    location?: Location;
    description?: string;
    travel_time?: string;
    video_ref?: VideoRef;
}

export interface Comment {
    comment_id: string;
    content: string;
    user_id: string;
    rating?: number;
    created_at: string;
}

export interface SocialPlan {
    plan_id: string;
    title: string;
    description: string;
    match_reason?: string;
    thumbnail: string;
    tags: string[];
    author: string;
    like_count: number;
    created_at: string;
}

export interface SocialPlanDetail extends SocialPlan {
    itinerary: ItineraryDay[]; // or generic struct
    comments: Comment[];
}

export interface Souvenir {
    name: string;
    price: string;
    img?: string;
}

export interface VideoCacheItem {
    videoUrls: string[];
    generatedImageUrls?: string[];
    generatedVideoUrl?: string | null;
}

export interface ItineraryDay {
    day: number;
    items: ScheduleItem[];
}

export interface Itinerary {
    proposalId: number | string;
    days: ItineraryDay[];
    souvenirs: Souvenir[];
}

interface TravelContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    profile: TravelProfile | null;
    setProfile: (profile: TravelProfile) => void;
    proposals: Proposal[];
    setProposals: (proposals: Proposal[]) => void;
    selectedProposal: Proposal | null;
    setSelectedProposal: (proposal: Proposal | null) => void;
    itinerary: Itinerary | null;
    setItinerary: (itinerary: Itinerary | null) => void;
    videoCache: Record<string, VideoCacheItem>;
    setVideoCache: React.Dispatch<React.SetStateAction<Record<string, VideoCacheItem>>>;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('ja');
    const [profile, setProfile] = useState<TravelProfile | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [videoCache, setVideoCache] = useState<Record<string, VideoCacheItem>>({});

    const t = (key: TranslationKey): string => {
        return translations[language][key] || key;
    };

    return (
        <TravelContext.Provider value={{
            language, setLanguage, t,
            profile, setProfile,
            proposals, setProposals,
            selectedProposal, setSelectedProposal,
            itinerary, setItinerary,
            videoCache, setVideoCache
        }}>
            {children}
        </TravelContext.Provider>
    );
};

export const useTravel = () => {
    const context = useContext(TravelContext);
    if (context === undefined) {
        throw new Error('useTravel must be used within a TravelProvider');
    }
    return context;
};
