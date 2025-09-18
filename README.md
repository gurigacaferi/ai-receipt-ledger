# Receipt OCR Expense Tracker

A production-ready MVP that uses AI-powered OCR to automatically extract expense data from receipt images and provides comprehensive expense tracking and reporting.

## Features

- **AI-Powered Receipt Parsing**: Upload receipt images and automatically extract vendor, date, amount, and itemized details using OpenAI Vision
- **Expense Management**: Automatic categorization and structured storage of expenses
- **Monthly Reports**: Visual analytics with Chart.js showing spending trends
- **CSV Export**: Download filtered expense data
- **Cost Optimized**: Client-side image resizing and server-side caching

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL
- **AI**: OpenAI Vision API with structured JSON output
- **Charts**: Chart.js via react-chartjs-2
- **Storage**: Local file storage (dev) with S3/R2 abstraction ready

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and setup
git clone <repo-url>
cd receipt-ocr-expense-tracker

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Add your OpenAI API key to backend/.env
# OPENAI_API_KEY=your_key_here

# Start all services
docker compose up --build

# Wait for services to be healthy, then visit:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

### Option 2: Local Development

```bash
# 1. Start PostgreSQL
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=receipt_tracker -p 5432:5432 -d postgres:15

# 2. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Run migrations and start server
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Setup Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Project Structure

```
├── frontend/          # Next.js 14 + TypeScript
├── backend/           # FastAPI + SQLAlchemy
├── infra/            # Docker Compose + configs
├── docker-compose.yml
└── README.md
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/receipt_tracker
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL_VISION=gpt-4o-mini
OPENAI_TEMPERATURE=0.1
BASE_URL=http://localhost:8000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## API Endpoints

- `POST /invoices` - Upload receipt image
- `POST /invoices/{id}/parse` - Parse receipt with AI
- `GET /expenses` - List expenses with filters
- `GET /reports/monthly` - Monthly spending analytics
- `GET /exports/expenses.csv` - Export expenses as CSV

## Usage

1. **Upload Receipt**: Go to `/` and upload a receipt image
2. **View Expenses**: Check `/expenses` for parsed transactions
3. **Analytics**: Visit `/reports` for monthly spending charts
4. **Export**: Download CSV from expenses page

## Development

### Adding New Categories
Edit `backend/app/services/categorization.py` to add new vendor/category mappings.

### Switching to S3/R2 Storage
Implement the S3 driver in `backend/app/services/storage.py` and update environment variables.

### Adding Authentication
The codebase is structured to easily integrate NextAuth.js or Clerk. User context is isolated in the auth service.

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Build and deploy containers
4. Set up reverse proxy with HTTPS
5. Configure proper CORS origins

## License

MIT License