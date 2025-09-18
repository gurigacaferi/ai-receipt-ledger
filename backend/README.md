# Receipt OCR Backend

FastAPI backend with SQLAlchemy, Alembic migrations, and OpenAI Vision integration.

## Setup

### Local Development

1. **Install Python 3.11+**

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and database URL
   ```

5. **Setup database**
   ```bash
   # Start PostgreSQL (or use Docker)
   docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=receipt_tracker -p 5432:5432 -d postgres:15
   
   # Run migrations
   alembic upgrade head
   ```

6. **Start server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

```bash
docker compose up --build
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/receipt_tracker

# OpenAI
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL_VISION=gpt-4o-mini
OPENAI_TEMPERATURE=0.1

# Storage (for future S3/R2 support)
STORAGE_BUCKET=receipts
STORAGE_ENDPOINT=
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Application
BASE_URL=http://localhost:8000
```

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## AI Parsing Options

### Option A: OpenAI Vision (Current)
- Direct image-to-JSON parsing using GPT-4 Vision
- Higher accuracy, lower latency
- More expensive per request

### Option B: OCR + LLM Pipeline (TODO)
To implement OCR-first approach:

1. **Add OCR provider**
   ```bash
   pip install pytesseract  # or use cloud providers
   ```

2. **Implement OCRParserService**
   ```python
   # In app/services/ai_parser.py
   class OCRParserService:
       async def extract_text(self, image_url: str) -> str:
           # Use Tesseract/Cloud Vision/Textract
           pass
       
       async def normalize_text(self, raw_text: str) -> ParsedReceipt:
           # Use LLM to structure the text
           pass
   ```

3. **Update parser selection**
   ```python
   # Choose parser based on config
   parser = OCRParserService() if USE_OCR else AIParserService()
   ```

## Storage Backends

### Current: Local Storage
Files saved to `uploads/` directory.

### Future: S3/R2 Storage
1. **Install boto3**
   ```bash
   pip install boto3
   ```

2. **Implement S3StorageDriver**
   ```python
   # In app/services/storage.py - already stubbed
   class S3StorageDriver(StorageInterface):
       # Implement save_file and delete_file methods
   ```

3. **Update environment variables**
   ```bash
   STORAGE_BUCKET=your-bucket
   STORAGE_ACCESS_KEY=your-access-key
   STORAGE_SECRET_KEY=your-secret-key
   STORAGE_ENDPOINT=https://your-endpoint.com  # for R2
   ```

## Authentication Integration

Current: Hard-coded user ID for MVP

### NextAuth.js Integration
```python
# In app/services/auth.py
class AuthService:
    def authenticate_request(self, token: str) -> uuid.UUID:
        # Verify JWT token from NextAuth
        # Return user ID from token payload
```

### Clerk Integration
```python
# In app/services/auth.py
class AuthService:
    def authenticate_request(self, token: str) -> uuid.UUID:
        # Verify Clerk session token
        # Return user ID from Clerk API
```

## Rate Limiting

Add rate limiting middleware:

```python
# In app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to endpoints
@limiter.limit("5/minute")
@router.post("/invoices/{invoice_id}/parse")
async def parse_invoice(...):
    pass
```

## Production Deployment

1. **Environment Setup**
   - Set production DATABASE_URL
   - Configure CORS origins
   - Set BASE_URL to production domain

2. **Database**
   - Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
   - Run migrations: `alembic upgrade head`

3. **Application**
   - Use production WSGI server (gunicorn)
   - Set up reverse proxy (nginx)
   - Configure HTTPS

4. **Monitoring**
   - Add structured logging
   - Set up health checks
   - Monitor API usage and costs

## Cost Optimization

1. **Image Preprocessing**
   - Client-side resizing (implemented in frontend)
   - Image compression before upload

2. **Caching**
   - Cache parsed results in database
   - Avoid re-parsing same receipts

3. **Rate Limiting**
   - Prevent abuse and control costs
   - Implement per-user quotas

## Architecture Notes

- **Modular Design**: Services are isolated and easily replaceable
- **Storage Abstraction**: Easy to switch between local/S3/R2
- **Auth Abstraction**: Ready for NextAuth/Clerk integration
- **Database**: PostgreSQL with proper indexing for performance
- **AI Integration**: Structured prompts with validation