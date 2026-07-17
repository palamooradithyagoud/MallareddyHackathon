import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

import urllib.parse

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    if os.getenv("VERCEL"):
        DATABASE_URL = "sqlite:////tmp/jobs.db"
    else:
        DATABASE_URL = "sqlite:///./jobs.db"

# Automatically resolve and URL-encode passwords containing special characters (e.g. '@')
def clean_db_url(url: str) -> str:
    if not url or "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    if "@" in rest:
        creds, host_info = rest.rsplit("@", 1)
        if ":" in creds:
            user, password = creds.split(":", 1)
            # URL-encode only if not already percent-encoded
            if "%" not in password:
                password = urllib.parse.quote_plus(password)
            creds = f"{user}:{password}"
        rest = f"{creds}@{host_info}"
    return f"{scheme}://{rest}"

DATABASE_URL = clean_db_url(DATABASE_URL)

# Force pg8000 driver for PostgreSQL connections
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)

# Handle SQLite threading issue
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
