from pydantic import BaseModel
from typing import List, Optional, Any, Union



class Location(BaseModel):
    lat: float
    lng: float

# --- Auth & User Models ---

class UserBase(BaseModel):
    username: str
    display_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    indoor_outdoor: Optional[str] = None
    hobbies: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: Any  # Simply typing as Any to avoid datetime serialization complexity for now

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Plan API Models ---

class TravelProfileRequest(BaseModel):
    mode: str
    pref_locations: Optional[List[str]] = None
    selected_tags: Optional[List[str]] = []
    custom_attributes: Optional[str] = None
    nights: Optional[int] = 1
    departure_location: Optional[str] = None
    language: str

class PopularTagsResponse(BaseModel):
    tags: List[str]

class ProposalResponse(BaseModel):
    id: int
    title: str
    tagline: str
    desc: str
    match: int
    color: str
    location: str

class ItineraryRequest(BaseModel):
    proposalId: Union[str, int]
    title: str
    language: str
    nights: int = 1  # Default to 1 night (2 days) if not specified


class ScheduleItem(BaseModel):
    time: str
    activity: str
    icon: str
    location: Optional[Location] = None
    description: Optional[str] = None
    travel_time: Optional[str] = None  # New field for travel time to this activity or next

class ItineraryDay(BaseModel):
    day: int
    items: List[ScheduleItem]

class Souvenir(BaseModel):
    name: str
    price: str

class ItineraryResponse(BaseModel):
    proposalId: Union[str, int]
    days: List[ItineraryDay]
    souvenirs: List[Souvenir]

class BrushUpRequest(BaseModel):
    proposalId: Union[str, int]
    title: str
    language: str
    current_itinerary: ItineraryResponse
    request: str
    history: List[str] = []

# --- Search API Models ---

class SearchFilter(BaseModel):
    mode: Optional[str] = None

class SearchPlansRequest(BaseModel):
    query: str
    filter: Optional[SearchFilter] = None
    limit: Optional[int] = 10

class PlanSummary(BaseModel):
    plan_id: Union[str, int]
    title: str
    description: str
    match_reason: str
    thumbnail: str
    tags: List[str]
    author: str

class SearchResultsResponse(BaseModel):
    results: List[PlanSummary]


# --- Social & Sharing Models ---

class SharePlanRequest(BaseModel):
    plan_id: Union[str, int, None] = None # If updating an existing plan
    title: str
    description: str
    thumbnail: Optional[str] = None
    tags: List[str] = []
    itinerary: List[Any] # Flexible struct for now, or match ItineraryDay
    souvenirs: List[Any] = []
    total_duration_minutes: Optional[int] = 0
    target_mode: Optional[str] = None

class SocialPlan(BaseModel):
    plan_id: Union[str, int]
    title: str
    description: str
    thumbnail: Optional[str] = None
    tags: List[str] = []
    author: Optional[str] = None
    like_count: int = 0
    created_at: Any
    match_reason: Optional[str] = None # For search results

class SocialPlanDetail(SocialPlan):
    itinerary: List[Any]
    souvenirs: List[Souvenir] = []
    comments: List[Any] = []

class CommentRequest(BaseModel):
    content: str
    rating: Optional[int] = None

class CommentResponse(BaseModel):
    comment_id: str
    content: str
    user_id: str
    created_at: Any

# --- Report API Models ---

class ReportRequest(BaseModel):
    plan_id: Union[str, int, None] = None
    comment: str
    rating: int
    photos: List[str] = []

class ReportResponse(BaseModel):
    status: str
    ai_analysis: str
