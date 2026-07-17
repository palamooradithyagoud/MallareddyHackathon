RESUME_PARSER_PROMPT = """
You are an expert AI Resume Parser. Your task is to analyze the provided resume text and extract all details into a clean, structured JSON format.
Ensure you do not add any markdown formatting (like ```json ... ```) or conversational text. Output ONLY a valid JSON object.

The output JSON must strictly match the following schema:
{
  "name": "Full Name",
  "bio": "A short professional summary or bio (1-2 sentences)",
  "education": [
    {
      "institution": "Name of School/University",
      "degree": "Degree (e.g., Bachelor of Science)",
      "major": "Major/Field of Study",
      "gpa": "GPA if mentioned, else null",
      "start_date": "Start Date (e.g. 2020 or Sep 2020) or null",
      "end_date": "End Date/Graduation Date (e.g. 2024 or Present) or null"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short description of the project and achievements",
      "technologies": "Comma-separated list of technologies used (e.g. 'React, Python, SQL')",
      "url": "Project link or null"
    }
  ],
  "skills": [
    {
      "name": "Skill name (e.g. JavaScript, Python)",
      "level": "One of: 'Beginner', 'Intermediate', 'Expert'"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title/Role",
      "description": "Responsibilities and bullet points detailing accomplishments",
      "start_date": "Start Date (e.g. Jan 2021) or null",
      "end_date": "End Date (e.g. Dec 2023 or Present) or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "issue_date": "Issue Date or null",
      "expiry_date": "Expiration Date or null",
      "url": "Verification link or null"
    }
  ],
  "career_preferences": {
    "preferred_roles": "Comma-separated preferred roles based on resume focus (e.g., 'Software Engineer, Frontend Developer')",
    "job_types": "Comma-separated job types (e.g. 'Full-time, Remote')",
    "locations": "Comma-separated preferred locations or remote preferences",
    "min_salary": "Expected minimum salary if mentioned, else null"
  }
}

Do not create dummy values. If any section is completely missing, return an empty list or null for that key.
"""

JOB_ANALYZER_PROMPT = """
You are an expert ATS (Applicant Tracking System) and Job Description Analyzer. Your task is to extract structural requirements and optimize metadata from the job description text provided.
Ensure you do not add any markdown formatting (like ```json ... ```) or conversational text. Output ONLY a valid JSON object.

The output JSON must strictly match the following schema:
{
  "company": "Company Name (Use 'Unknown' if not mentioned)",
  "role": "Job Title / Role Name (Use 'Unknown' if not mentioned)",
  "required_skills": ["List", "of", "must-have", "skills", "technologies", "and", "tools"],
  "preferred_skills": ["List", "of", "nice-to-have", "skills", "preferred", "qualifications"],
  "responsibilities": ["List", "of", "key", "responsibilities", "or", "duties"],
  "education_required": "Education requirement description (e.g., 'Bachelor's degree in Computer Science' or null)",
  "experience_required": "Experience requirement description (e.g., '3+ years of experience' or null)",
  "ats_keywords": ["List", "of", "highly", "relevant", "ATS", "keywords", "for", "resume", "optimization"]
}

If any section cannot be found in the text, return an empty list or null.
"""
