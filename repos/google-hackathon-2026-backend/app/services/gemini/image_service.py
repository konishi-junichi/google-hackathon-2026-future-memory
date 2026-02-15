import os
import logging
import traceback
import httpx
import io
from google import genai
from google.genai import types
from app.services.storage import storage_service as storage
import asyncio
import time
from app.services.places.places_service import get_place_photo_bytes, get_place_photos_bytes
from app.prompts.image import get_image_generation_prompt

logger = logging.getLogger(__name__)


class ImageService:
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.use_mock = os.getenv("USE_MOCK_AGENT", "false").lower() == "true"
        self.is_initialized = bool(self.project_id)
        if not self.is_initialized and not self.use_mock:
             logger.warning("GCP_PROJECT_ID not found. ImageService running in mock mode.")

    async def generate_travel_image(self, destination: str, description: str, user_image_url: str = None, user_id: int | str = None, reference_image_bytes: bytes = None) -> str:
        # Optimize log: truncate long strings
        req_desc = description[:50] + "..." if len(description) > 50 else description
        req_user_img = user_image_url[:47] + "..." if user_image_url and len(user_image_url) > 50 else (user_image_url or "None")
        logger.info(f"Generating travel image for Destination: {destination}, Description: {req_desc}, UserImage: {req_user_img}, UserId: {user_id}")
        
        if self.use_mock or not self.is_initialized:
             return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"

        max_retries = 5
        for attempt in range(max_retries + 1):
            try:
                client = genai.Client(
                    vertexai=True
                )

                prompt_parts = []
                sources_used = []
                
                # Base prompt
                prompt_text = f"Generate a high-quality, photorealistic travel photo of the person provided in the user image, visiting {destination}. "
                prompt_text += f"The background should clearly be {destination}. " 
                prompt_text += f"Description of the vibe: {description}. "
                prompt_text += "Cinematic lighting, 4k."

                # 1. Fetch Destination Image from Places API (or use provided)
                if reference_image_bytes:
                    destination_image_bytes = reference_image_bytes
                    logger.info(f"Using provided reference photo for {destination}")
                    sources_used.append(f"Provided Reference Photo")
                else:
                    destination_image_bytes = await get_place_photo_bytes(destination)
                    if destination_image_bytes:
                        sources_used.append(f"Places API Image for {destination}")
                    
                if destination_image_bytes:
                    prompt_text += " Refer to the provided destination image for the background scenery and atmosphere."
                    prompt_parts.append(types.Part.from_bytes(data=destination_image_bytes, mime_type="image/jpeg")) 
                else:
                    sources_used.append("None (Places API failed or returned no image)")
                    prompt_text += " Ensure the location looks authentic."

                # 2. Add User Image
                if user_image_url and user_image_url.startswith("gs://"):
                    logger.info(f"Using user profile image from: {req_user_img}")
                    sources_used.append("User Profile Image (GCS)")
                    
                    mime_type = "image/png"
                    if user_image_url.lower().endswith(".jpg") or user_image_url.lower().endswith(".jpeg"):
                        mime_type = "image/jpeg"
                    elif user_image_url.lower().endswith(".webp"):
                        mime_type = "image/webp"

                    image_part = types.Part.from_uri(
                        file_uri=user_image_url,
                        mime_type=mime_type,
                    )
                    prompt_parts.append(image_part)
                    prompt_text += " The person in this image is the traveler. Integrate them naturally into the scene."
                else:
                    sources_used.append("None (User image not provided or invalid)")
                
                final_parts = [types.Part.from_text(text=prompt_text)] + prompt_parts
                
                # Log exact prompt usage
                logger.info(f"--- Gemini Image Generation Prompt Info ---")
                logger.info(f"Sources Used: {', '.join(sources_used)}")
                logger.info(f"Text Prompt: {prompt_text}")
                logger.info(f"Total Parts Payload: {len(final_parts)} parts (1 text + {len(prompt_parts)} images)")
                logger.info(f"-------------------------------------------")
                
                contents = [
                    types.Content(
                        role="user",
                        parts=final_parts
                    )
                ]
                
                generate_content_config = types.GenerateContentConfig(
                    temperature = 1,
                    top_p = 0.95,
                    max_output_tokens = 32768,
                    response_modalities = ["TEXT", "IMAGE"],
                    safety_settings = [types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="1K", 
                        output_mime_type="image/png",
                    ),
                )

                # Use generate_content_stream
                response_stream = await client.aio.models.generate_content_stream(
                    model="gemini-2.5-flash-image",
                    contents=contents,
                    config=generate_content_config,
                )
                
                generated_image_bytes = None
                generated_image_mime = "image/png"

                async for chunk in response_stream:
                    if not chunk.candidates:
                        continue
                    for candidate in chunk.candidates:
                        for part in candidate.content.parts:
                            if part.inline_data and part.inline_data.data:
                                generated_image_bytes = part.inline_data.data
                                generated_image_mime = part.inline_data.mime_type or "image/png"
                                break
                        if generated_image_bytes: break
                    if generated_image_bytes: break
                
                if generated_image_bytes:
                    # Save to GCS
                    filename = "generated_travel.png"
                    file_obj = io.BytesIO(generated_image_bytes)
                    uri = storage.save_image(file_obj, filename, generated_image_mime, user_id=user_id)
                    logger.info(f"Saved generated image to: {uri}")
                    return storage.generate_signed_url(uri)
                
                logger.warning(f"No image data found in Gemini response (Attempt {attempt+1}/{max_retries+1})")
                if attempt < max_retries:
                    logger.info("Retrying...")
                    continue
                return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"

            except Exception as e:
                is_resource_exhausted = "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)
                if is_resource_exhausted and attempt < max_retries:
                    logger.warning(f"Image generation rate limited. Waiting 5 seconds before retry... (Attempt {attempt+1}/{max_retries+1})")
                    await asyncio.sleep(5)
                    continue
                
                logger.error(f"Image generation failed: {e}")
                logger.error(traceback.format_exc())
                return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"

    async def generate_travel_images(self, destination: str, description: str, user_image_url: str = None, user_id: int | str = None) -> list[str]:
        """
        Generates 2 distinct images based on themes extracted from the description.
        """
        logger.info(f"Generating 2 travel images for {destination}. Description: {description[:50]}...")
        
        if self.use_mock or not self.is_initialized:
            return [
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
                "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"
            ]

        try:
            client = genai.Client(vertexai=True)

            # 1. Extract Themes
            theme_prompt = f"""
            Analyze this travel plan description: "{description}" for a trip to {destination}.
            Extract 2 distinct, visually rich themes or scenes for travel photography that capture different aspects of this trip (e.g., scenery, cultural activity, food, atmosphere).
            Return ONLY a valid JSON list of 2 strings. Example: ["Peaceful Zen garden with autumn leaves", "Bustling night market with neon lights"]
            """
            
            theme_response = await client.aio.models.generate_content(
                model="gemini-3-flash-preview",
                contents=theme_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )
            
            import json
            themes = []
            try:
                themes = json.loads(theme_response.text)
                if not isinstance(themes, list) or len(themes) == 0:
                    logger.warning("Failed to parse themes, using fallback.")
                    throw_error
            except Exception:
                # Fallback themes if parsing fails
                themes = [
                    f"Scenic view of {destination}, {description[:50]}",
                    f"Cultural atmosphere of {destination}",
                    f"Hidden gem in {destination}"
                ]
            
            logger.info(f"Extracted themes: {themes}")

            # 2. Pre-fetch distinct place photos
            # Fetch up to 3 distinct photos
            place_photos = await get_place_photos_bytes(destination, limit=3)
            logger.info(f"Fetched {len(place_photos)} reference photos from Places API")

            # 3. Generate Images in Parallel
            # Limit to 2 themes just in case
            themes = themes[:2]
            
            tasks = []
            for i, theme in enumerate(themes):
                # Assign a different photo to each task if available, cycling if necessary
                ref_photo = None
                if place_photos:
                    ref_photo = place_photos[i % len(place_photos)]
                
                tasks.append(self.generate_travel_image(destination, theme, user_image_url, user_id, reference_image_bytes=ref_photo))
            
            image_urls = await asyncio.gather(*tasks)
            
            return image_urls

        except Exception as e:
            logger.error(f"Multi-image generation failed: {e}")
            logger.error(traceback.format_exc())
            return ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"]
