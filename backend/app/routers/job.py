import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import requests
from app.database.database import get_db
from app.models.models import User, JobAnalysis
from app.schemas.schemas import JobAnalysisRequest, JobAnalysisResponse
from app.utils.auth_utils import get_current_user
from app.services.ai_service import analyze_job_with_groq

router = APIRouter(
    prefix="/job",
    tags=["Job Analysis"]
)

def clean_html(html_content: str) -> str:
    """Simple parser to strip script, style tags and HTML tags to extract clean text."""
    # Remove script and style elements
    html_content = re.sub(r'<script.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    html_content = re.sub(r'<style.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    
    # Replace common block elements with newlines
    html_content = re.sub(r'</?(div|p|h[1-6]|li|tr|section|nav|footer)>', '\n', html_content, flags=re.IGNORECASE)
    
    # Strip remaining HTML tags
    text = re.sub(r'<.*?>', '', html_content)
    
    # Decode HTML entities
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&quot;', '"', text)
    
    # Clean up whitespace
    text = re.sub(r'\n\s*\n', '\n', text)
    return text.strip()


@router.post("/analyze", response_model=JobAnalysisResponse)
def analyze_job(
    request_data: JobAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_text = ""
    
    if request_data.job_description:
        job_text = request_data.job_description
    elif request_data.job_url:
        try:
            # Add simple headers to look like a browser
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = requests.get(request_data.job_url, headers=headers, timeout=10)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Could not load webpage. Status code: {response.status_code}"
                )
            
            job_text = clean_html(response.text)
            if not job_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Webpage content was empty or could not be parsed."
                )
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch job description from URL: {str(e)}"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either job_description or job_url."
        )

    try:
        # Call Groq analysis service
        analyzed_data = analyze_job_with_groq(job_text)
        
        # Save to database
        db_analysis = JobAnalysis(
            user_id=current_user.id,
            company=analyzed_data.get("company", "Unknown"),
            role=analyzed_data.get("role", "Unknown"),
            required_skills=",".join(analyzed_data.get("required_skills", [])),
            preferred_skills=",".join(analyzed_data.get("preferred_skills", [])),
            responsibilities="\n".join(analyzed_data.get("responsibilities", [])),
            education_required=analyzed_data.get("education_required"),
            experience_required=analyzed_data.get("experience_required"),
            ats_keywords=",".join(analyzed_data.get("ats_keywords", [])),
            raw_description=job_text[:5000] # Cap raw description storage size
        )
        
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        # Format list outputs for the schema response
        return JobAnalysisResponse(
            id=db_analysis.id,
            company=db_analysis.company,
            role=db_analysis.role,
            required_skills=analyzed_data.get("required_skills", []),
            preferred_skills=analyzed_data.get("preferred_skills", []),
            responsibilities=analyzed_data.get("responsibilities", []),
            education_required=db_analysis.education_required,
            experience_required=db_analysis.experience_required,
            ats_keywords=analyzed_data.get("ats_keywords", []),
            created_at=db_analysis.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job analysis failed: {str(e)}"
        )


@router.get("/history")
def get_job_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves list of past job analyses for the current user."""
    analyses = db.query(JobAnalysis).filter(JobAnalysis.user_id == current_user.id).order_by(JobAnalysis.created_at.desc()).all()
    
    response = []
    for item in analyses:
        response.append({
            "id": item.id,
            "company": item.company,
            "role": item.role,
            "required_skills": [s.strip() for s in item.required_skills.split(",")] if item.required_skills else [],
            "preferred_skills": [s.strip() for s in item.preferred_skills.split(",")] if item.preferred_skills else [],
            "responsibilities": [r.strip() for r in item.responsibilities.split("\n")] if item.responsibilities else [],
            "education_required": item.education_required,
            "experience_required": item.experience_required,
            "ats_keywords": [k.strip() for k in item.ats_keywords.split(",")] if item.ats_keywords else [],
            "created_at": item.created_at
        })
    return response
