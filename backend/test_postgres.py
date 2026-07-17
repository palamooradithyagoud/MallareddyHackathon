import sqlalchemy
from sqlalchemy import create_engine

# Let's test ap-south-1 (Mumbai) pooler
db_url = "postgresql+pg8000://postgres.szogxxuppqsnybefaptq:adithyagoud%40789@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

print("Testing connection to Supabase ap-south-1 (Mumbai) pooler...")
try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(sqlalchemy.text("SELECT version();"))
        print("\n[SUCCESS] Connected to Supabase PostgreSQL using IPv4 pooler!")
        print(f"Version: {result.fetchone()[0]}")
except Exception as e:
    print(f"\n[FAILED] ap-south-1 connection failed: {str(e)}")
