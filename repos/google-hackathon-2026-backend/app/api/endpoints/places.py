from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
import requests
import os
import logging

# Configure router
router = APIRouter()
logger = logging.getLogger(__name__)

# Request Models
class PlacePhotoRequest(BaseModel):
    query: str

class PlacePhotoResponse(BaseModel):
    image_url: str | None
    author_attributions: list[dict[str, str]] | None = None

# Environment Variables
# Using GOOGLE_PLACE_API_KEY as requested by user
GOOGLE_PLACE_API_KEY = os.getenv("GOOGLE_PLACE_API_KEY", "")

# In-memory cache for place photos
_image_cache = {}

@router.post("/photo", response_model=PlacePhotoResponse)
async def get_place_photo(request: PlacePhotoRequest):
    """
    Fetches a photo URL for a place query using Google Places API (New).
    Values privacy and backend-controlled API usage.
    """
    if not GOOGLE_PLACE_API_KEY:
        logger.warning("GOOGLE_PLACE_API_KEY is not set.")
        return PlacePhotoResponse(image_url=None)

    query = request.query
    if not query:
        return PlacePhotoResponse(image_url=None)

    # Check cache
    if query in _image_cache:
        cached = _image_cache[query]
        logger.info(f"Returning cached image for: {query}")
        return PlacePhotoResponse(
            image_url=cached.get("url"), 
            author_attributions=cached.get("attributions")
        )

    try:
        # 1. Text Search (New) to get Place ID/Name
        # POST https://places.googleapis.com/v1/places:searchText
        search_url = 'https://places.googleapis.com/v1/places:searchText'
        headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACE_API_KEY,
            'X-Goog-FieldMask': 'places.photos,places.photos.authorAttributions' # Include attributions
        }
        body = {
            'textQuery': query
        }

        # Sync request using 'requests' library
        response = requests.post(search_url, json=body, headers=headers, timeout=10)
        response.raise_for_status()
        
        search_data = response.json()

        if search_data.get('places') and len(search_data['places']) > 0:
             place = search_data['places'][0]
             if place.get('photos') and len(place['photos']) > 0:
                 photo = place['photos'][0]
                 # 2. Construct Photo URL
                 photo_resource_name = photo['name']
                 photo_url = f"https://places.googleapis.com/v1/{photo_resource_name}/media?maxHeightPx=800&maxWidthPx=800&key={GOOGLE_PLACE_API_KEY}"
                 
                 # 3. Get Attributions
                 attributions = photo.get('authorAttributions', [])
                 
                 # Store in cache
                 _image_cache[query] = {
                     "url": photo_url,
                     "attributions": attributions
                 }
                 
                 return PlacePhotoResponse(
                     image_url=photo_url,
                     author_attributions=attributions
                 )
        
        # Cache negative results
        _image_cache[query] = {"url": None, "attributions": None}
        logger.info(f"No photos found for query: {query}")
        return PlacePhotoResponse(image_url=None)

    except Exception as e:
        logger.error(f"Failed to fetch place photo: {e}")
        return PlacePhotoResponse(image_url=None)
