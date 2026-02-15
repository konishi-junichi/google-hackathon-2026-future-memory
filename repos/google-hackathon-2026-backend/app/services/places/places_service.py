import os
import logging
import traceback
import httpx

logger = logging.getLogger(__name__)


async def get_place_photos_bytes(destination: str, limit: int = 1) -> list[bytes]:
    """Fetches up to 'limit' distinct photos for a destination."""
    api_key = os.getenv("GOOGLE_PLACE_API_KEY")
    if not api_key:
        logger.warning("GOOGLE_PLACE_API_KEY not set. Skipping Places API.")
        return []

    try:
        async with httpx.AsyncClient() as client:
            # 1. Search for the place to get its photos
            search_url = "https://places.googleapis.com/v1/places:searchText"
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": "places.photos" 
            }
            payload = {
                "textQuery": destination
            }
            
            response = await client.post(search_url, headers=headers, json=payload, timeout=10.0)
            if response.status_code != 200:
                logger.warning(f"Places Search API returned {response.status_code}: {response.text}")
                return []
                
            data = response.json()
            
            if not data.get("places") or len(data["places"]) == 0:
                logger.warning(f"No places found for destination: {destination}")
                return []
            
            place = data["places"][0]
            if not place.get("photos") or len(place["photos"]) == 0:
                logger.warning(f"No photos found for place found for: {destination}")
                return []
            
            # 2. Get up to 'limit' photo resource names
            photos_data = place["photos"][:limit]
            
            # 3. Fetch photos in parallel
            import asyncio
            
            async def fetch_single_photo(photo_data):
                photo_name = photo_data["name"]
                # logger.info(f"Fetching photo from Places API: {photo_name}")
                photo_url = f"https://places.googleapis.com/v1/{photo_name}/media?key={api_key}&maxHeightPx=1024&maxWidthPx=1024"
                photo_response = await client.get(photo_url, follow_redirects=True, timeout=15.0)
                if photo_response.status_code == 200:
                    return photo_response.content
                return None

            tasks = [fetch_single_photo(p) for p in photos_data]
            results = await asyncio.gather(*tasks)
            
            return [r for r in results if r is not None]

    except Exception as e:
        logger.error(f"Error fetching place photos: {e}")
        logger.error(traceback.format_exc())
        return []

async def get_place_photo_bytes(destination: str) -> bytes | None:
    photos = await get_place_photos_bytes(destination, limit=1)
    return photos[0] if photos else None

