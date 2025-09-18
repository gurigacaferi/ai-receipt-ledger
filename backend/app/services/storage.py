import os
import uuid
from abc import ABC, abstractmethod
from typing import BinaryIO
import aiofiles

class StorageInterface(ABC):
    @abstractmethod
    async def save_file(self, file: BinaryIO, filename: str) -> str:
        """Save file and return URL"""
        pass
    
    @abstractmethod
    async def delete_file(self, url: str) -> bool:
        """Delete file by URL"""
        pass

class LocalStorageDriver(StorageInterface):
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
    
    async def save_file(self, file: BinaryIO, filename: str) -> str:
        # Generate unique filename
        file_ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(self.upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return URL
        base_url = os.getenv("BASE_URL", "http://localhost:8000")
        return f"{base_url}/uploads/{unique_filename}"
    
    async def delete_file(self, url: str) -> bool:
        try:
            filename = url.split("/")[-1]
            file_path = os.path.join(self.upload_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False

class S3StorageDriver(StorageInterface):
    """TODO: Implement S3/R2 storage driver"""
    def __init__(self, bucket: str, region: str, access_key: str, secret_key: str, endpoint: str = None):
        self.bucket = bucket
        self.region = region
        self.access_key = access_key
        self.secret_key = secret_key
        self.endpoint = endpoint
        # TODO: Initialize boto3 client
    
    async def save_file(self, file: BinaryIO, filename: str) -> str:
        # TODO: Upload to S3/R2 and return public URL
        raise NotImplementedError("S3 storage not implemented yet")
    
    async def delete_file(self, url: str) -> bool:
        # TODO: Delete from S3/R2
        raise NotImplementedError("S3 storage not implemented yet")

# Storage service factory
def get_storage_service() -> StorageInterface:
    # For now, always use local storage
    # TODO: Check environment variables to determine which driver to use
    return LocalStorageDriver()

storage_service = get_storage_service()