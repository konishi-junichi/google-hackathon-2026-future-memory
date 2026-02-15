import logging
from typing import List, Dict, Any

# Import new services
from app.services.gemini.plan_design_service import PlanDesignService
from app.services.gemini.image_service import ImageService
from app.services.gemini.video_service import VideoService
from app.services.places.places_service import get_place_photo_bytes

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Facade class that delegates to specialized services.
    Retains the original interface for compatibility.
    """
    def __init__(self):
        self.plan_service = PlanDesignService()
        self.image_service = ImageService()
        self.video_service = VideoService()

    async def generate_proposals(self, mode: str, language: str, selected_tags: List[str] = None, custom_attributes: str = None, nights: int = 1, departure_location: str = None) -> List[Dict[str, Any]]:
        return await self.plan_service.generate_proposals(mode, language, selected_tags, custom_attributes, nights, departure_location)

    async def generate_itinerary(self, proposal_id: int, title: str, language: str, nights: int = 1) -> Dict[str, Any]:
        return await self.plan_service.generate_itinerary(proposal_id, title, language, nights)

    async def brush_up_itinerary(self, current_itinerary: Dict[str, Any], request: str, history: List[str]) -> Dict[str, Any]:
        return await self.plan_service.brush_up_itinerary(current_itinerary, request, history)

    async def generate_travel_images(self, destination: str, description: str, user_image_url: str = None, user_id: int | str = None) -> List[str]:
        return await self.image_service.generate_travel_images(destination, description, user_image_url, user_id)

    async def generate_travel_image(self, destination: str, description: str, user_image_url: str = None, user_id: int | str = None) -> str:
        return await self.image_service.generate_travel_image(destination, description, user_image_url, user_id)

    async def generate_travel_video(self, destination: str, description: str, user_image_url: str = None, user_id: int | str = None) -> str:
        return await self.video_service.generate_travel_video(destination, description, user_image_url, user_id)

    async def _get_place_photo_bytes(self, destination: str) -> bytes | None:
        """
        Delegates to the standalone function in places_service.
        Kept for compatibility if invoked directly, though typically it's internal.
        """
        return await get_place_photo_bytes(destination)
