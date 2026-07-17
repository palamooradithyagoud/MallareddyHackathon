import sqlalchemy
from sqlalchemy import create_engine

# Test with standard 'postgres' username
db_url = "postgresql+pg8000://postgres:adithyagoud%40789@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

print("Testing connection to Mumbai pooler with 'postgres' username...")
try:
    engine = create_engine(db_url, connect_args={"timeout": 5})
    with engine.connect() as conn:
        result = conn.execute(sqlalchemy.text("SELECT version();"))
        print("\n[SUCCESS] Connected to Supabase PostgreSQL!")
        print(f"Version: {result.fetchone()[0]}")
except Exception as e:
    print(f"\n[FAILED] Connection failed: {str(e)}")
