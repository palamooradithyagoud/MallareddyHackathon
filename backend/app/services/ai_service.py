import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv
from app.prompts.prompts import RESUME_PARSER_PROMPT, JOB_ANALYZER_PROMPT

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = "llama3-8b-8192"

logger = logging.getLogger("uvicorn.error")

try:
    if GROQ_API_KEY:
        client = Groq(api_key=GROQ_API_KEY)
    else:
        client = None
        logger.warning("GROQ_API_KEY not set. Backend will run in mock AI mode.")
except Exception as e:
    client = None
    logger.error(f"Error initializing Groq client: {str(e)}. Falling back to mock mode.")


def parse_resume_with_groq(resume_text: str) -> dict:
    """Parses resume text using Groq Llama 3 model, falls back to a smart mock parser if no API key is set."""
    if not client:
        return get_mock_resume_data(resume_text)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": RESUME_PARSER_PROMPT},
                {"role": "user", "content": f"Parse the following resume text:\n\n{resume_text}"}
            ],
            model=MODEL_NAME,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        result_text = chat_completion.choices[0].message.content
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Groq API resume parse failed: {str(e)}. Falling back to mock data.")
        return get_mock_resume_data(resume_text)


def analyze_job_with_groq(job_text: str) -> dict:
    """Analyzes job description text using Groq, falls back to a smart mock analyzer if no API key is set."""
    if not client:
        return get_mock_job_analysis(job_text)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": JOB_ANALYZER_PROMPT},
                {"role": "user", "content": f"Analyze the following job description:\n\n{job_text}"}
            ],
            model=MODEL_NAME,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        result_text = chat_completion.choices[0].message.content
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Groq API job analysis failed: {str(e)}. Falling back to mock data.")
        return get_mock_job_analysis(job_text)


def get_mock_resume_data(text: str) -> dict:
    """Generates reactive mock data parsed from resume text keywords."""
    lower_text = text.lower()
    
    # Try to extract a name
    name = "John Doe"
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        # Check first line
        if len(lines[0]) < 30 and not any(kw in lines[0].lower() for kw in ["resume", "cv", "email", "phone"]):
            name = lines[0]

    # Reactive skills extraction
    detected_skills = []
    skill_options = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "SQL",
        "Docker", "AWS", "Git", "HTML", "CSS", "TailwindCSS", "C++", "Java", "Go"
    ]
    for skill in skill_options:
        if skill.lower() in lower_text:
            detected_skills.append({"name": skill, "level": "Expert" if "lead" in lower_text or "senior" in lower_text else "Intermediate"})
    
    if not detected_skills:
        detected_skills = [
            {"name": "React", "level": "Intermediate"},
            {"name": "Python", "level": "Expert"},
            {"name": "SQL", "level": "Intermediate"}
        ]

    # Reactive education
    education = []
    if "university" in lower_text or "college" in lower_text:
        school = "Sample State University"
        for line in lines:
            if "university" in line.lower() or "college" in line.lower():
                school = line
                break
        education.append({
            "institution": school,
            "degree": "Bachelor of Science" if "bachelor" in lower_text or "b.s" in lower_text else "Master of Science",
            "major": "Computer Science" if "computer" in lower_text else "Information Technology",
            "gpa": "3.8" if "gpa" in lower_text else None,
            "start_date": "2020",
            "end_date": "2024"
        })
    else:
        education.append({
            "institution": "Tech University",
            "degree": "B.Tech",
            "major": "Computer Science and Engineering",
            "gpa": "3.7",
            "start_date": "2019",
            "end_date": "2023"
        })

    # Experience
    experience = []
    if "experience" in lower_text or "work" in lower_text or "employment" in lower_text:
        experience.append({
            "company": "Innovative Solutions Corp",
            "role": "Software Engineer" if "engineer" in lower_text else "Developer",
            "description": "Led the frontend team in migration to React with TypeScript. Optimized API performance on FastAPI backend by 35%. Managed deployments using Docker and GitHub Actions.",
            "start_date": "2023-06",
            "end_date": "Present"
        })
    else:
        experience.append({
            "company": "StartUp Tech Labs",
            "role": "Junior Developer",
            "description": "Collaborated with design team to develop high-performance responsive web pages. Created REST endpoints using Python. Wrote automated tests in PyTest.",
            "start_date": "2022-01",
            "end_date": "2023-05"
        })

    # Projects
    projects = [
        {
            "title": "E-Commerce Microservices Platform",
            "description": "Built scalable store endpoints serving high requests per second. Used React on the frontend and FastAPI on the backend.",
            "technologies": "React, FastAPI, PostgreSQL, Docker",
            "url": "https://github.com/mockuser/ecommerce-micro"
        }
    ]

    # Certifications
    certifications = []
    if "aws" in lower_text:
        certifications.append({
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "issue_date": "2024",
            "expiry_date": "2027",
            "url": None
        })
    else:
        certifications.append({
            "name": "Full Stack Software Engineering Certificate",
            "issuer": "FreeCodeCamp",
            "issue_date": "2023",
            "expiry_date": None,
            "url": None
        })

    return {
        "name": name,
        "bio": "Motivated software engineer with experience developing modern, highly-responsive web applications and backend systems.",
        "education": education,
        "projects": projects,
        "skills": detected_skills,
        "experience": experience,
        "certifications": certifications,
        "career_preferences": {
            "preferred_roles": "Software Engineer, Full Stack Developer",
            "job_types": "Full-time, Remote",
            "locations": "Remote, New York, San Francisco",
            "min_salary": "$90,000"
        }
    }


def get_mock_job_analysis(text: str) -> dict:
    """Generates reactive mock job analysis from job description keywords."""
    lower_text = text.lower()
    
    # Simple company extraction
    company = "Tech Corporation"
    for line in text.split("\n"):
        if "company:" in line.lower() or "about" in line.lower():
            company = line.split(":")[-1].strip()
            break
            
    # Simple role extraction
    role = "Software Engineer"
    role_keywords = ["frontend developer", "backend engineer", "fullstack developer", "data scientist", "product manager"]
    for kw in role_keywords:
        if kw in lower_text:
            role = kw.title()
            break

    # Required Skills
    req_skills = []
    skill_options = ["Python", "React", "TypeScript", "Node.js", "Docker", "AWS", "SQL", "TailwindCSS"]
    for s in skill_options:
        if s.lower() in lower_text:
            req_skills.append(s)
            
    if not req_skills:
        req_skills = ["React", "TypeScript", "Node.js"]

    # Preferred Skills
    pref_skills = []
    pref_options = ["Kubernetes", "FastAPI", "Next.js", "GraphQL", "NoSQL", "CI/CD"]
    for s in pref_options:
        if s.lower() in lower_text:
            pref_skills.append(s)
    if not pref_skills:
        pref_skills = ["FastAPI", "Docker"]

    # Responsibilities
    responsibilities = []
    for line in text.split("\n"):
        line_clean = line.strip().lstrip("-*•").strip()
        if len(line_clean) > 20 and len(line_clean) < 150 and any(kw in line_clean.lower() for kw in ["design", "develop", "maintain", "build", "collaborate", "write", "lead"]):
            responsibilities.append(line_clean)
            if len(responsibilities) >= 4:
                break
    if not responsibilities:
        responsibilities = [
            "Develop and maintain scalable React applications.",
            "Collaborate with backend engineers to integrate RESTful API endpoints.",
            "Write high-quality, maintainable, and testable code.",
            "Participate in design discussions and code reviews to enforce quality standards."
        ]

    # ATS Keywords
    ats_keywords = list(set(req_skills + pref_skills + ["Agile", "REST APIs", "Git", "Software Development Life Cycle"]))

    return {
        "company": company,
        "role": role,
        "required_skills": req_skills,
        "preferred_skills": pref_skills,
        "responsibilities": responsibilities,
        "education_required": "Bachelor's degree in Computer Science or equivalent experience",
        "experience_required": "2+ years of professional software engineering experience",
        "ats_keywords": ats_keywords
    }
