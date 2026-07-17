import os
import shutil
import requests
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import (
    User, Profile, Education, Project, Skill, Experience, Certification, CareerPreference
)
from app.schemas.schemas import ResumeParseResponse
from app.utils.auth_utils import get_current_user
from app.utils.parser_utils import extract_text_from_file
from app.services.ai_service import parse_resume_with_groq
from app.services.supabase_service import upload_to_supabase_storage

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF, DOCX, or TXT."
        )

    # Make unique filename
    filename = f"user_{current_user.id}_resume.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    try:
        file_bytes = file.file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read upload stream: {str(e)}"
        )

    # 1. Try uploading to Supabase Storage
    supabase_url = upload_to_supabase_storage(file_bytes, filename, file.content_type)
    
    # Update resume URL in profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    if supabase_url:
        profile.resume_url = supabase_url
    else:
        # Fallback: Save locally
        try:
            with open(filepath, "wb") as buffer:
                buffer.write(file_bytes)
            profile.resume_url = f"/uploads/{filename}"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save file locally: {str(e)}"
            )
            
    db.commit()
    return {"resume_url": profile.resume_url, "filename": file.filename}


@router.post("/parse", response_model=ResumeParseResponse)
def parse_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.resume_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume has been uploaded yet."
        )

    try:
        # Check if remote URL (Supabase) or local file path
        if profile.resume_url.startswith("http"):
            response = requests.get(profile.resume_url, timeout=15)
            if response.status_code != 200:
                raise Exception(f"Http download failed with code: {response.status_code}")
            file_bytes = response.content
            filename = profile.resume_url.split("/")[-1].split("?")[0]
        else:
            filename = os.path.basename(profile.resume_url)
            filepath = os.path.join(UPLOAD_DIR, filename)
            if not os.path.exists(filepath):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Uploaded resume file not found on server."
                )
            with open(filepath, "rb") as f:
                file_bytes = f.read()
        
        # 1. Extract text
        resume_text = extract_text_from_file(filename, file_bytes)
        
        # 2. Parse using Groq
        parsed_data = parse_resume_with_groq(resume_text)
        
        # 3. Populate Profile
        # Set bio if returned
        if parsed_data.get("bio"):
            profile.bio = parsed_data.get("bio")
            
        # Update user name if profile name returned and currently empty
        if parsed_data.get("name") and not current_user.full_name:
            current_user.full_name = parsed_data.get("name")

        # Update Education (Delete old, insert parsed)
        if parsed_data.get("education"):
            db.query(Education).filter(Education.profile_id == profile.id).delete()
            for edu in parsed_data["education"]:
                new_edu = Education(
                    profile_id=profile.id,
                    institution=edu.get("institution", "Unknown"),
                    degree=edu.get("degree"),
                    major=edu.get("major"),
                    gpa=str(edu.get("gpa")) if edu.get("gpa") else None,
                    start_date=str(edu.get("start_date")) if edu.get("start_date") else None,
                    end_date=str(edu.get("end_date")) if edu.get("end_date") else None
                )
                db.add(new_edu)

        # Update Projects
        if parsed_data.get("projects"):
            db.query(Project).filter(Project.profile_id == profile.id).delete()
            for proj in parsed_data["projects"]:
                new_proj = Project(
                    profile_id=profile.id,
                    title=proj.get("title", "Untitled Project"),
                    description=proj.get("description"),
                    technologies=proj.get("technologies"),
                    url=proj.get("url")
                )
                db.add(new_proj)

        # Update Skills
        if parsed_data.get("skills"):
            db.query(Skill).filter(Skill.profile_id == profile.id).delete()
            for skill in parsed_data["skills"]:
                new_skill = Skill(
                    profile_id=profile.id,
                    name=skill.get("name", "Unknown Skill"),
                    level=skill.get("level", "Intermediate")
                )
                db.add(new_skill)

        # Update Experience
        if parsed_data.get("experience"):
            db.query(Experience).filter(Experience.profile_id == profile.id).delete()
            for exp in parsed_data["experience"]:
                new_exp = Experience(
                    profile_id=profile.id,
                    company=exp.get("company", "Unknown Company"),
                    role=exp.get("role", "Unknown Role"),
                    description=exp.get("description"),
                    start_date=str(exp.get("start_date")) if exp.get("start_date") else None,
                    end_date=str(exp.get("end_date")) if exp.get("end_date") else None
                )
                db.add(new_exp)

        # Update Certifications
        if parsed_data.get("certifications"):
            db.query(Certification).filter(Certification.profile_id == profile.id).delete()
            for cert in parsed_data["certifications"]:
                new_cert = Certification(
                    profile_id=profile.id,
                    name=cert.get("name", "Unknown Certification"),
                    issuer=cert.get("issuer"),
                    issue_date=str(cert.get("issue_date")) if cert.get("issue_date") else None,
                    expiry_date=str(cert.get("expiry_date")) if cert.get("expiry_date") else None,
                    url=cert.get("url")
                )
                db.add(new_cert)

        # Update Career Preferences
        if parsed_data.get("career_preferences"):
            pref = db.query(CareerPreference).filter(CareerPreference.profile_id == profile.id).first()
            if not pref:
                pref = CareerPreference(profile_id=profile.id)
                db.add(pref)
            
            p_data = parsed_data["career_preferences"]
            pref.preferred_roles = p_data.get("preferred_roles")
            pref.job_types = p_data.get("job_types")
            pref.locations = p_data.get("locations")
            pref.min_salary = str(p_data.get("min_salary")) if p_data.get("min_salary") else None

        db.commit()
        db.refresh(profile)
        db.refresh(current_user)

        return parsed_data

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Parsing error: {str(e)}"
        )
