from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    full_name: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str  # The OAuth token from Google client
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


# Education Schemas
class EducationBase(BaseModel):
    institution: str
    degree: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationOut(EducationBase):
    id: int
    profile_id: int

    class Config:
        orm_mode = True


# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    profile_id: int

    class Config:
        orm_mode = True


# Skill Schemas
class SkillBase(BaseModel):
    name: str
    level: Optional[str] = "Intermediate"

class SkillCreate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int
    profile_id: int

    class Config:
        orm_mode = True


# Experience Schemas
class ExperienceBase(BaseModel):
    company: str
    role: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceOut(ExperienceBase):
    id: int
    profile_id: int

    class Config:
        orm_mode = True


# Certification Schemas
class CertificationBase(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationOut(CertificationBase):
    id: int
    profile_id: int

    class Config:
        orm_mode = True


# Career Preferences Schemas
class CareerPreferenceBase(BaseModel):
    preferred_roles: Optional[str] = None
    job_types: Optional[str] = None
    locations: Optional[str] = None
    min_salary: Optional[str] = None

class CareerPreferenceCreate(CareerPreferenceBase):
    pass

class CareerPreferenceOut(CareerPreferenceBase):
    id: int
    profile_id: int

    class Config:
        orm_mode = True


# Profile Schemas
class ProfileBase(BaseModel):
    bio: Optional[str] = None
    resume_url: Optional[str] = None

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    resume_url: Optional[str] = None
    education: Optional[List[EducationCreate]] = None
    projects: Optional[List[ProjectCreate]] = None
    skills: Optional[List[SkillCreate]] = None
    experience: Optional[List[ExperienceCreate]] = None
    certifications: Optional[List[CertificationCreate]] = None
    career_preferences: Optional[CareerPreferenceCreate] = None

class ProfileOut(ProfileBase):
    id: int
    user_id: int
    education: List[EducationOut] = []
    projects: List[ProjectOut] = []
    skills: List[SkillOut] = []
    experience: List[ExperienceOut] = []
    certifications: List[CertificationOut] = []
    career_preferences: Optional[CareerPreferenceOut] = None

    class Config:
        orm_mode = True


# Job Analysis Schemas
class JobAnalysisRequest(BaseModel):
    job_url: Optional[str] = None
    job_description: Optional[str] = None

class JobAnalysisResponse(BaseModel):
    id: int
    company: Optional[str] = None
    role: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    responsibilities: List[str] = []
    education_required: Optional[str] = None
    experience_required: Optional[str] = None
    ats_keywords: List[str] = []
    created_at: datetime

    class Config:
        orm_mode = True
        
class ResumeParseResponse(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    education: List[EducationCreate] = []
    projects: List[ProjectCreate] = []
    skills: List[SkillCreate] = []
    experience: List[ExperienceCreate] = []
    certifications: List[CertificationCreate] = []
    career_preferences: Optional[CareerPreferenceCreate] = None
