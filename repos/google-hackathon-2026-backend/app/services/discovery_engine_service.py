import os
from google.cloud import discoveryengine_v1 as discoveryengine
from typing import List
import logging

logger = logging.getLogger(__name__)

class DiscoveryEngineService:
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        if not self.project_id:
            logger.warning("GCP_PROJECT_ID is not set.")
            
        self.location = "global"  # Discovery Engine often uses 'global'
        
        self.data_store_id = os.getenv("DATA_STORE_ID")
        if not self.data_store_id:
            logger.warning("DATA_STORE_ID is not set.")
        self.client = discoveryengine.SearchServiceClient()

    async def search_video_urls(self, query: str, page_size: int = 5) -> List[str]:
        """
        Searches the data store for video URLs matching the query.
        """
        try:
            serving_config = self.client.serving_config_path(
                project=self.project_id,
                location=self.location,
                data_store=self.data_store_id,
                serving_config="default_config",
            )

            request = discoveryengine.SearchRequest(
                serving_config=serving_config,
                query=query,
                page_size=page_size,
            )

            # Execution is generic, but the client is usually thread-safe.
            # For better performance in FastAPI, we could run this in a threadpool.
            import asyncio
            response = await asyncio.to_thread(self.client.search, request)

            video_urls = []
            for result in response.results:
                struct_data = result.document.struct_data
                if struct_data and "video_url" in struct_data:
                    video_urls.append(struct_data["video_url"])
            
            logger.info(f"Discovery Engine search for '{query}' returned {len(video_urls)} URLs.")
            return video_urls
        except Exception as e:
            logger.error(f"Discovery Engine search failed: {e}")
            return []
