from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database.database import engine, Base
from app.routers import auth, profile, resume, job

# Create all database tables on start
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Intelligent Job Application Assistant API",
    description="API backend for parsing resumes and analyzing job descriptions using Groq.",
    version="1.0.0"
)

# CORS configuration to allow local React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all. Change for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(job.router, prefix="/api")

# Serve uploaded resumes as static files (useful for front-end download/view link)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Job Application Assistant API is running.",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
