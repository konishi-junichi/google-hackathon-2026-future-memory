import os
import logging
import traceback
import asyncio
import httpx
from google import genai
from google.genai import types
from app.services.storage import storage_service as storage
from app.services.places.places_service import get_place_photo_bytes
from app.prompts.video import get_video_generation_prompt

logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.use_mock = os.getenv("USE_MOCK_AGENT", "false").lower() == "true"
        self.is_initialized = bool(self.project_id)
        if not self.is_initialized and not self.use_mock:
             logger.warning("GCP_PROJECT_ID not found. VideoService running in mock mode.")

    async def generate_travel_video(self, destination: str, description: str, user_image_url: str = None, user_id: int | str = None) -> str:
        logger.info(f"Generating travel video for Destination: {destination}, Description: {description[:50]}..., UserImage: {user_image_url}, UserId: {user_id}")
        
        if self.use_mock or not self.is_initialized:
             # Return a sample video URL for mock mode
             return storage.generate_signed_url("https://storage.googleapis.com/travel-experience-designer-bucket/travel_movie/sample_video.mp4")

        try:
            client = genai.Client(vertexai=True)
            
            # 1. Fetch Images
            destination_image_bytes = await get_place_photo_bytes(destination)
            
            user_image_bytes = None
            if user_image_url:
                if user_image_url.startswith("gs://"):
                    # Download from GCS if it's a gs URI
                    user_image_bytes = storage.get_file_bytes(user_image_url)
                elif user_image_url.startswith("http"):
                    # Download from HTTP
                    async with httpx.AsyncClient() as http_client:
                        resp = await http_client.get(user_image_url)
                        if resp.status_code == 200:
                            user_image_bytes = resp.content

            # 2. Prepare Source
            # Because reference_images feature is restricted (not allowlisted), we fallback to using a single image in source.image
            # We prioritize the user image to make it personalized.
            
            primary_image_bytes = None
            primary_mime_type = "image/jpeg"
            
            if user_image_bytes:
                primary_image_bytes = user_image_bytes
                # Determine mime type
                if user_image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
                    primary_mime_type = "image/png"
                elif user_image_bytes.startswith(b'\xff\xd8'):
                    primary_mime_type = "image/jpeg"
                elif user_image_bytes.startswith(b'RIFF') and user_image_bytes[8:12] == b'WEBP':
                     primary_mime_type = "image/webp"
                
                # Use imported prompt function? Or construct here as it's dynamic based on image?
                # The prompt structure was slightly adjusted for single image.
                # Let's keep the logic inline or update the imported prompt helper to handle this.
                # The helper I created: get_video_generation_prompt(destination, description, has_user_image, has_destination_image)
                # Let's use it.
                
                prompt = get_video_generation_prompt(destination, description, has_user_image=True, has_destination_image=False)

            elif destination_image_bytes:
                primary_image_bytes = destination_image_bytes
                 # Determine mime type
                if destination_image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
                    primary_mime_type = "image/png"
                elif destination_image_bytes.startswith(b'\xff\xd8'):
                    primary_mime_type = "image/jpeg"
                elif destination_image_bytes.startswith(b'RIFF') and destination_image_bytes[8:12] == b'WEBP':
                     primary_mime_type = "image/webp"

                prompt = get_video_generation_prompt(destination, description, has_user_image=False, has_destination_image=True)
            else:
                 # No images available
                logger.warning("No images found for video generation.")
                return ""

            source = types.GenerateVideosSource(
                prompt=prompt,
                image=types.Image(image_bytes=primary_image_bytes, mime_type=primary_mime_type)
            )

            # 3. Configure
            bucket_name = os.getenv("GCS_BUCKET_NAME")
            if not bucket_name:
                logger.warning("GCS_BUCKET_NAME is not set.")
            output_gcs_uri = f"gs://{bucket_name}/travel_movie/"

            config = types.GenerateVideosConfig(
                aspect_ratio="9:16",
                number_of_videos=1,
                duration_seconds=4,
                person_generation="allow_all",
                generate_audio=True,
                resolution="720p",
                output_gcs_uri=output_gcs_uri,
            )

            # 4. Generate
            logger.info(f"Calling Veo 3.1 Fast for video generation. Output: {output_gcs_uri}")
            operation = client.models.generate_videos(
                model="veo-3.1-fast-generate-001", 
                source=source, 
                config=config
            )

            # 5. Wait for completion
            while not operation.done:
                logger.info("Video generation in progress... waiting 10 seconds.")
                await asyncio.sleep(10)
                operation = client.operations.get(operation)

            response = operation.result
            if not response or not response.generated_videos:
                logger.error("No videos were generated.")
                return ""

            generated_video = response.generated_videos[0]
            if generated_video.video and generated_video.video.uri:
                logger.info(f"Video generated successfully: {generated_video.video.uri}")
                return storage.generate_signed_url(generated_video.video.uri)
            
            # If uri is not directly available, check if we need to construct it from GCS
            logger.info("Video generation completed, returning first video URL.")
            return ""

        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            logger.error(traceback.format_exc())
            return ""
