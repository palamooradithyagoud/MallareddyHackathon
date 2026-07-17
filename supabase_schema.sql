-- ==========================================
-- SUPABASE POSTGRESQL DATABASE SCHEMA REFERENCE
-- ==========================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR, -- Nullable for Google OAuth users
    full_name VARCHAR,
    created_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    resume_url VARCHAR,
    created_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Education Table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    institution VARCHAR NOT NULL,
    degree VARCHAR,
    major VARCHAR,
    gpa VARCHAR,
    start_date VARCHAR,
    end_date VARCHAR
);

-- 4. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    technologies VARCHAR,
    url VARCHAR
);

-- 5. Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    level VARCHAR DEFAULT 'Intermediate'
);

-- 6. Create Experience Table
CREATE TABLE IF NOT EXISTS experience (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    company VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    description TEXT,
    start_date VARCHAR,
    end_date VARCHAR
);

-- 7. Create Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    issuer VARCHAR,
    issue_date VARCHAR,
    expiry_date VARCHAR,
    url VARCHAR
);

-- 8. Create Career Preferences Table
CREATE TABLE IF NOT EXISTS career_preferences (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_roles VARCHAR,
    job_types VARCHAR,
    locations VARCHAR,
    min_salary VARCHAR
);

-- 9. Create Job Analysis Table
CREATE TABLE IF NOT EXISTS job_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR,
    role VARCHAR,
    required_skills TEXT,
    preferred_skills TEXT,
    responsibilities TEXT,
    education_required VARCHAR,
    experience_required VARCHAR,
    ats_keywords TEXT,
    raw_description TEXT,
    created_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW())
);

-- ==========================================
-- SUPABASE AUTH USER SYNCHRONIZATION TRIGGER
-- ==========================================

-- Trigger function to automatically insert new oauth/google signups into public.users and public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_user_id integer;
BEGIN
    INSERT INTO public.users (email, full_name)
    VALUES (
        new.email,
        COALESCE(
            new.raw_user_meta_data->>'full_name', 
            new.raw_user_meta_data->>'name', 
            split_part(new.email, '@', 1)
        )
    )
    ON CONFLICT (email) DO UPDATE 
    SET full_name = EXCLUDED.full_name
    RETURNING id INTO new_user_id;

    INSERT INTO public.profiles (user_id)
    VALUES (new_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
EXCEPTION
    WHEN others THEN
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
