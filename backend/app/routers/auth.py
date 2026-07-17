from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, Profile, CareerPreference
from app.schemas.schemas import UserCreate, UserLogin, Token, GoogleLoginRequest, UserOut
from app.utils.auth_utils import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create empty profile and career preferences for the user
    new_profile = Profile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    new_pref = CareerPreference(profile_id=new_profile.id)
    db.add(new_pref)
    db.commit()
    
    return new_user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password"
        )
        
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }


from app.services.supabase_service import supabase_client

@router.post("/google-login", response_model=Token)
def google_login(google_data: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Securely handles authentication with Google credentials.
    Verifies the Supabase access token directly with Supabase Auth, extracts verified user details,
    registers new users, self-heals missing profiles/preferences, and returns a local JWT.
    """
    if not google_data.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supabase access token (credential) is required"
        )
        
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase client is not initialized on the backend"
        )
        
    # Verify the Supabase token server-side
    try:
        user_resp = supabase_client.auth.get_user(google_data.credential)
        supabase_user = user_resp.user
        if not supabase_user or not supabase_user.email:
            raise ValueError("Authenticated user email is empty or invalid")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Supabase token: {str(e)}"
        )
        
    # Use only verified email and name extracted from the verified token
    email = supabase_user.email
    full_name = (
        supabase_user.user_metadata.get("full_name") 
        or supabase_user.user_metadata.get("name") 
        or email.split("@")[0]
    )
        
    # Find or register user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=None, # OAuth user
            full_name=full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Self-healing check: Ensure profile record exists
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Self-healing check: Ensure career preferences record exists
    pref = db.query(CareerPreference).filter(CareerPreference.profile_id == profile.id).first()
    if not pref:
        new_pref = CareerPreference(profile_id=profile.id)
        db.add(new_pref)
        db.commit()
        
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }


@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
