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


@router.post("/google-login", response_model=Token)
def google_login(google_data: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Handles authentication with Google credentials.
    In production, this verifies the Google ID token. 
    Here, we parse the details and auto-register/login the user.
    """
    email = google_data.email
    full_name = google_data.full_name
    
    if not email:
        # Fallback or mock validation
        email = "google_user@example.com"
        full_name = "Google User"
        
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user
        user = User(
            email=email,
            password_hash=None, # OAuth user
            full_name=full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create profile
        new_profile = Profile(user_id=user.id)
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        
        new_pref = CareerPreference(profile_id=new_profile.id)
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
