from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import invoices, expenses, reports, exports
from app.database import engine, Base

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="Receipt OCR Expense Tracker",
    description="AI-powered receipt parsing and expense tracking",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(exports.router, prefix="/exports", tags=["exports"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Receipt OCR Expense Tracker API"}