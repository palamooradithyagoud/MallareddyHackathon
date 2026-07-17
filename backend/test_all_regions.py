import sqlalchemy
from sqlalchemy import create_engine
import concurrent.futures

regions = [
    "ap-south-1",      # Mumbai
    "ap-southeast-1",  # Singapore
    "ap-southeast-2",  # Sydney
    "ap-northeast-1",  # Tokyo
    "ap-northeast-2",  # Seoul
    "us-east-1",       # N. Virginia
    "us-east-2",       # Ohio
    "us-west-1",       # N. California
    "us-west-2",       # Oregon
    "eu-west-1",       # Ireland
    "eu-west-2",       # London
    "eu-west-3",       # Paris
    "eu-central-1",    # Frankfurt
    "sa-east-1",       # Sao Paulo
    "ca-central-1"     # Canada
]

def test_region(region):
    db_url = f"postgresql+pg8000://postgres.szogxxuppqsnybefaptq:adithyagoud%40789@aws-0-{region}.pooler.supabase.com:6543/postgres"
    try:
        engine = create_engine(db_url, connect_args={"timeout": 5})
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1;"))
            return region, True, None
    except Exception as e:
        return region, False, str(e)

print("Scanning Supabase regional connection poolers (this will take a few seconds)...")
with concurrent.futures.ThreadPoolExecutor(max_workers=len(regions)) as executor:
    results = executor.map(test_region, regions)

success_found = False
for region, success, error in results:
    if success:
        print(f"\n[SUCCESS] Found your database region: {region}!")
        print(f"Connection URL: postgresql+pg8000://postgres.szogxxuppqsnybefaptq:[PASSWORD]@aws-0-{region}.pooler.supabase.com:6543/postgres")
        success_found = True
        break
    else:
        # Check if the error is auth or tenant mismatch rather than a timeout
        if "tenant/user" in error or "password" in error or "Authentication" in error:
            print(f" - {region}: Tenant/auth check failed ({error[:60]})")

if not success_found:
    print("\n[FAILED] Could not connect to any regional poolers. Please verify your database password in .env.")
