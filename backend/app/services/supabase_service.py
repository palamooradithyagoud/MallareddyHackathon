import os
import logging
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

logger = logging.getLogger("uvicorn.error")

supabase_client: Optional[Client] = None

try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase Storage client initialized successfully.")
    else:
        logger.warning("SUPABASE_URL or SUPABASE_KEY not set. Resume uploads will fallback to local storage.")
except Exception as e:
    logger.error(f"Error initializing Supabase client: {str(e)}. Falling back to local storage.")


def upload_to_supabase_storage(file_bytes: bytes, file_name: str, content_type: str = "application/pdf") -> Optional[str]:
    """
    Uploads a file to Supabase Storage 'resumes' bucket and returns its public URL.
    Returns None if Supabase is not configured or upload fails.
    """
    if not supabase_client:
        return None

    bucket_name = "resumes"
    try:
        # Check if the bucket exists or attempt upload
        # Supabase API upload method expects bytes or a file-like object
        response = supabase_client.storage.from_(bucket_name).upload(
            path=file_name,
            file=file_bytes,
            file_options={
                "content-type": content_type,
                "x-upsert": "true"
            }
        )
        
        # Get the public URL of the uploaded asset
        public_url = supabase_client.storage.from_(bucket_name).get_public_url(file_name)
        logger.info(f"File {file_name} uploaded successfully to Supabase Storage. Public URL: {public_url}")
        return public_url

    except Exception as e:
        logger.error(f"Failed to upload to Supabase Storage: {str(e)}. Falling back to local storage.")
        return None
