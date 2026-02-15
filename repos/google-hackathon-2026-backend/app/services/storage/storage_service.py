from google.cloud import storage
import datetime
import uuid
import os
import logging
import traceback
from typing import BinaryIO

logger = logging.getLogger(__name__)

# Initialize Google Cloud Storage client
try:
    storage_client = storage.Client()
    bucket_name = os.getenv("GCS_BUCKET_NAME", "travel-experience-designer-bucket") # Default bucket name
    bucket = storage_client.bucket(bucket_name)
    logger.info(f"Initialized GCS client for bucket: {bucket_name}")
except Exception as e:
    logger.warning(f"Failed to initialize GCS client: {e}. Check GOOGLE_APPLICATION_CREDENTIALS.")
    storage_client = None
    bucket = None

def save_image(file: BinaryIO, filename: str, content_type: str, user_id: int | str = None) -> str:
    """
    Saves an image file to Google Cloud Storage.
    Returns the gs:// URI.
    """
    if not bucket:
        logger.error("GCS bucket not initialized.")
        raise Exception("GCS bucket not initialized.")

    try:
        # Generate a unique filename using UUID and timestamp
        unique_id = uuid.uuid4()
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Organize by user_id if provided, else put in a 'common' folder
        folder = f"user_{user_id}" if user_id else "common"
        blob_name = f"{folder}/{timestamp}_{unique_id}_{filename}"
        
        blob = bucket.blob(blob_name)
        blob.upload_from_file(file, content_type=content_type)
        
        gs_uri = f"gs://{bucket_name}/{blob_name}"
        logger.info(f"File uploaded to {gs_uri}")
        return gs_uri

    except Exception as e:
        logger.error(f"Failed to upload file to GCS: {e}")
        logger.error(traceback.format_exc())
        raise e

def generate_signed_url(gs_uri: str, expiration_minutes: int = 60) -> str:
    """
    Generates a signed URL for a GCS object.
    """
    if not bucket:
        return gs_uri # Return original URI if GCS is not configured (or mock)

    try:
        # gs_uri format: gs://bucket_name/blob_name
        if not gs_uri.startswith("gs://"):
            return gs_uri # Not a GS URI

        parts = gs_uri.replace("gs://", "").split("/", 1)
        if len(parts) != 2:
            return gs_uri

        b_name, blob_name = parts
        
        # Note: We are using the globally initialized bucket client which might be bound to a specific bucket. 
        # Ideally we should get a blob from a client that can access the bucket in URI.
        # But assuming we only use one bucket for now.
        
        blob = bucket.blob(blob_name)
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=expiration_minutes),
            method="GET",
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate signed URL: {e}")
        return gs_uri

def get_file_bytes(gs_uri: str) -> bytes | None:
    """
    Downloads a file from GCS and returns its bytes.
    """
    if not bucket:
        return None

    try:
        if not gs_uri.startswith("gs://"):
            return None
        
        parts = gs_uri.replace("gs://", "").split("/", 1)
        if len(parts) != 2:
            return None
            
        b_name, blob_name = parts
        blob = bucket.blob(blob_name)
        return blob.download_as_bytes()
    except Exception as e:
        logger.error(f"Failed to download file from GCS: {e}")
        return None

def upload_file(file_obj, filename, content_type):
    """
    Uploads a file object to GCS.
    """
    if not bucket:
        logger.error("GCS bucket not initialized.")
        return None
    
    blob = bucket.blob(filename)
    blob.upload_from_file(file_obj, content_type=content_type)
    return f"gs://{bucket_name}/{filename}"
