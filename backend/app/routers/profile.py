from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import (
    User, Profile, Education, Project, Skill, Experience, Certification, CareerPreference
)
from app.schemas.schemas import ProfileOut, ProfileUpdate
from app.utils.auth_utils import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.get("", response_model=ProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        # Create profile on the fly if it doesn't exist
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return profile


@router.put("", response_model=ProfileOut)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # 1. Update basic profile fields
    if profile_data.bio is not None:
        profile.bio = profile_data.bio
    if profile_data.resume_url is not None:
        profile.resume_url = profile_data.resume_url

    # 2. Update Education (Delete old, insert new)
    if profile_data.education is not None:
        db.query(Education).filter(Education.profile_id == profile.id).delete()
        for edu in profile_data.education:
            new_edu = Education(profile_id=profile.id, **edu.dict())
            db.add(new_edu)

    # 3. Update Projects (Delete old, insert new)
    if profile_data.projects is not None:
        db.query(Project).filter(Project.profile_id == profile.id).delete()
        for proj in profile_data.projects:
            new_proj = Project(profile_id=profile.id, **proj.dict())
            db.add(new_proj)

    # 4. Update Skills (Delete old, insert new)
    if profile_data.skills is not None:
        db.query(Skill).filter(Skill.profile_id == profile.id).delete()
        for skill in profile_data.skills:
            new_skill = Skill(profile_id=profile.id, **skill.dict())
            db.add(new_skill)

    # 5. Update Experience (Delete old, insert new)
    if profile_data.experience is not None:
        db.query(Experience).filter(Experience.profile_id == profile.id).delete()
        for exp in profile_data.experience:
            new_exp = Experience(profile_id=profile.id, **exp.dict())
            db.add(new_exp)

    # 6. Update Certifications (Delete old, insert new)
    if profile_data.certifications is not None:
        db.query(Certification).filter(Certification.profile_id == profile.id).delete()
        for cert in profile_data.certifications:
            new_cert = Certification(profile_id=profile.id, **cert.dict())
            db.add(new_cert)

    # 7. Update Career Preferences
    if profile_data.career_preferences is not None:
        pref = db.query(CareerPreference).filter(CareerPreference.profile_id == profile.id).first()
        if not pref:
            pref = CareerPreference(profile_id=profile.id)
            db.add(pref)
        
        pref_data = profile_data.career_preferences.dict()
        for key, val in pref_data.items():
            setattr(pref, key, val)

    db.commit()
    db.refresh(profile)
    return profile
