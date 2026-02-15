import type { Proposal, Itinerary, SocialPlan } from '../context/TravelContext';
import type { Language } from '../utils/translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Mock Data Generators reflecting "Gemini's Creativity" (Fallback)
const MOCK_PROPOSALS: Record<Language, Record<string, Proposal[]>> = {
    en: {
        senior: [
            {
                id: 1,
                title: 'Akizuki: Little Kyoto of Chikuzen',
                tagline: 'A silent walk through history.',
                desc: 'Experience the serenity of a castle town that time forgot. Perfect for history lovers seeking quiet contemplation.',
                match: 98,
                color: 'from-orange-400 to-pink-500',
                location: 'Akizuki, Asakura, Fukuoka'
            }
        ],
        family: [{ id: 101, title: 'Uminonakamichi', tagline: 'Seaside Adventure', desc: 'Mock Family Prop', match: 99, color: 'from-yellow-400 to-orange-500', location: 'Uminonakamichi' }],
        influencer: [{ id: 201, title: 'Itoshima', tagline: 'Sunset & Art', desc: 'Mock Influencer Prop', match: 96, color: 'from-pink-400 to-purple-500', location: 'Itoshima' }],
        active: [{ id: 301, title: 'Mt. Homan', tagline: 'Sacred Hike', desc: 'Mock Active Prop', match: 95, color: 'from-green-500 to-emerald-700', location: 'Mt. Homan' }],
        solo: [{ id: 401, title: 'Solo in Fukuoka', tagline: 'Self-discovery', desc: 'Mock Solo Prop', match: 97, color: 'from-indigo-400 to-cyan-500', location: 'Tenjin' }]
    },
    ja: {
        senior: [
            {
                id: 1,
                title: '秋月：筑前の小京都',
                tagline: '静寂の中に歴史を感じる散策',
                desc: '時が止まったような城下町で、静かな思索にふける。歴史好きのための心安らぐ旅。',
                match: 98,
                color: 'from-orange-400 to-pink-500',
                location: '福岡県朝倉市秋月'
            }
        ],
        family: [{ id: 101, title: '海の中道', tagline: '海辺の冒険', desc: 'Mock Family Prop', match: 99, color: 'from-yellow-400 to-orange-500', location: '海の中道海浜公園' }],
        influencer: [{ id: 201, title: '糸島', tagline: 'サンセット＆アート', desc: 'Mock Influencer Prop', match: 96, color: 'from-pink-400 to-purple-500', location: '福岡県糸島市' }],
        active: [{ id: 301, title: '宝満山', tagline: '修験の道を往く', desc: 'Mock Active Prop', match: 95, color: 'from-green-500 to-emerald-700', location: '宝満山' }],
        solo: [{ id: 401, title: '福岡一人旅', tagline: '自分を見つめる時間', desc: 'Mock Solo Prop', match: 97, color: 'from-indigo-400 to-cyan-500', location: '天神' }]
    }
};

const FALLBACK_PROPOSAL = (lang: Language): Proposal[] => lang === 'en' ? MOCK_PROPOSALS.en.senior : MOCK_PROPOSALS.ja.senior;
const FALLBACK_ITINERARY = (proposalId: number | string): Itinerary => ({
    proposalId: proposalId,
    days: [],
    souvenirs: []
});


export const GeminiService = {
    getPopularTags: async (): Promise<string[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/plan/tags`);
            if (!response.ok) throw new Error('Failed to fetch tags');
            const data = await response.json();
            return data.tags;
        } catch (error) {
            console.error(error);
            return ["歴史巡り", "グルメ", "絶景", "隠れ家", "温泉"];
        }
    },

    generateProposals: async (mode: string, language: Language, selectedTags: string[] = [], customAttributes: string = "", nights: number = 1, departureLocation: string = ""): Promise<Proposal[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/plan/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode,
                    language,
                    selected_tags: selectedTags,
                    custom_attributes: customAttributes,
                    nights,
                    departure_location: departureLocation
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            if (!data) return [];
            if (Array.isArray(data)) return data;
            // Handle case where backend returns { proposals: [...] } or checks keys
            return data.proposals || data.results || [];
        } catch (error) {
            console.error("Backend fetch failed, using mock:", error);
            // Fallback to mock data to prevent app crash if backend is down
            return new Promise((resolve) => {
                setTimeout(() => {
                    const category = MOCK_PROPOSALS[language][mode] ? MOCK_PROPOSALS[language][mode] : FALLBACK_PROPOSAL(language);
                    resolve(category);
                }, 1000);
            });
        }
    },

    generateItinerary: async (proposalId: number | string, title: string, language: Language, nights: number = 1): Promise<Itinerary> => {
        try {
            const response = await fetch(`${API_BASE_URL}/plan/itinerary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ proposalId, title, language, nights }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Backend fetch failed, using mock:", error);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(FALLBACK_ITINERARY(proposalId));
                }, 1500);
            });
        }
    },

    generateVideo: async (proposalId: number | string, title: string, description: string, userProfileImage?: string | null, userId?: number | string | null): Promise<{ videoUrls: string[], imageUrl?: string }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/media/generate-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    title,
                    description,
                    user_profile_image_url: userProfileImage,
                    user_id: userId
                })
            });
            if (!response.ok) throw new Error('Video API failed');
            const data = await response.json();
            return {
                videoUrls: data.videoUrls,
                imageUrl: data.generated_image_url
            };
        } catch (e) {
            console.error("Video fetch failed, returning mock", e);
            return {
                videoUrls: [],
                imageUrl: undefined
            };
        }
    },

    generateImage: async (proposalId: number | string, title: string, description: string, userProfileImage?: string | null, userId?: number | string | null): Promise<string[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/media/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    title,
                    description,
                    user_profile_image_url: userProfileImage,
                    user_id: userId
                })
            });
            if (!response.ok) throw new Error('Image API failed');
            const data = await response.json();
            return data.image_urls || [];
        } catch (e) {
            console.error("Image fetch failed", e);
            return [];
        }
    },

    searchShortVideos: async (proposalId: number | string, title: string, description: string): Promise<string[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/media/shorts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    title,
                    description
                })
            });
            if (!response.ok) throw new Error('Shorts API failed');
            const data = await response.json();
            return data.video_urls;
        } catch (e) {
            console.error("Shorts fetch failed", e);
            return [];
        }
    },

    generateAiVideo: async (proposalId: number | string, title: string, description: string, userProfileImage?: string | null, userId?: number | string | null): Promise<string> => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("AI Video generation skipped: User not logged in.");
            return "";
        }

        try {
            const response = await fetch(`${API_BASE_URL}/media/video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    proposalId,
                    title,
                    description,
                    user_profile_image_url: userProfileImage,
                    user_id: userId
                })
            });
            if (response.status === 401) {
                console.error('Unauthorized: AI Video generation requires login');
                return "";
            }
            if (!response.ok) throw new Error('AI Video API failed');
            const data = await response.json();
            return data.video_url;
        } catch (e) {
            console.error("AI Video fetch failed", e);
            return "";
        }
    },

    searchPlans: async (query: string, _mode?: string): Promise<SocialPlan[]> => {
        try {
            // Updated to support new backend logic
            const response = await fetch(`${API_BASE_URL}/social/plans?q=${encodeURIComponent(query)}&limit=20`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return data.results || [];
        } catch (e) {
            console.error("Search fetch failed, mock used", e);
            return [
                {
                    plan_id: "mock-1",
                    title: "Mock Plan: Kyoto Hidden Gems",
                    description: "A wonderful journey through the quiet side of Kyoto.",
                    match_reason: "Matches query",
                    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
                    tags: ["mock", "kyoto"],
                    author: "MockUser",
                    like_count: 120,
                    created_at: new Date().toISOString()
                }
            ];
        }
    },

    sharePlan: async (plan: any): Promise<{ plan_id: string, message: string, status: 'created' | 'updated' | 'duplicate' }> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Not logged in");

        const response = await fetch(`${API_BASE_URL}/plan/share`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plan)
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) throw new Error('Share failed');
        return await response.json();
    },

    likePlan: async (planId: string): Promise<void> => {
        await fetch(`${API_BASE_URL}/social/plans/${planId}/like`, { method: 'POST' });
    },

    addToFavorites: async (plan: any): Promise<{ plan_id: string, message: string, status: 'created' | 'updated' | 'duplicate' }> => {
        const token = localStorage.getItem('token'); // Simplistic token retreival
        console.log("addToFavorites token present:", !!token);
        if (!token) {
            throw new Error("Not logged in");
        }

        const response = await fetch(`${API_BASE_URL}/users/me/favorites`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plan)
        });

        if (response.status === 401) {
            localStorage.removeItem('token'); // Clear invalid token
            throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) throw new Error('Failed to add to favorites');
        return await response.json();
    },

    getFavorites: async (): Promise<SocialPlan[]> => {
        const token = localStorage.getItem('token');
        if (!token) return [];

        const response = await fetch(`${API_BASE_URL}/users/me/favorites`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    },

    getMySharedPlans: async (): Promise<SocialPlan[]> => {
        const token = localStorage.getItem('token');
        if (!token) return [];

        const response = await fetch(`${API_BASE_URL}/users/me/shared`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    },

    deleteFavorite: async (favId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Not logged in");

        const response = await fetch(`${API_BASE_URL}/users/me/favorites/${favId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Delete failed');
    },

    deleteSharedPlan: async (planId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Not logged in");

        const response = await fetch(`${API_BASE_URL}/users/me/shared/${planId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Delete failed');
    },

    submitReport: async (planId: string, rating: number, comment: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: planId, rating, comment })
            });
            return await response.json();
        } catch (e) {
            console.error("Report failed", e);
            return { status: "success", ai_analysis: "Mock analysis: Feedback recorded." };
        }
    },

    getPlan: async (planId: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/social/plans/${planId}`, {
            method: 'GET'
        });
        if (!response.ok) throw new Error('Failed to fetch plan');
        return await response.json();
    },

    brushUpPlan: async (proposalId: number | string, title: string, language: Language, currentItinerary: Itinerary, request: string, history: string[]): Promise<Itinerary> => {
        try {
            const response = await fetch(`${API_BASE_URL}/plan/brushup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proposalId,
                    title,
                    language,
                    current_itinerary: currentItinerary,
                    request,
                    history
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Backend fetch failed (brushUpPlan):", error);
            throw error;
        }
    },

    getPlacePhoto: async (query: string): Promise<{ image_url: string | null, author_attributions?: any[] }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/places/photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                console.error(`Backend request failed with status: ${response.status}`);
                return { image_url: null };
            }

            const data = await response.json();
            return {
                image_url: data.image_url,
                author_attributions: data.author_attributions
            };
        } catch (error) {
            console.error("Failed to fetch place image via Backend", error);
            return { image_url: null };
        }
    }
};
