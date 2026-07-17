-- ==========================================
-- SUPABASE POSTGRESQL DATABASE SCHEMA REFERENCE
-- ==========================================

-- 1. Drop existing tables if they exist to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS job_analysis CASCADE;
DROP TABLE IF EXISTS career_preferences CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR, -- Nullable for OAuth/Google users
    full_name VARCHAR,
    created_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Profiles Table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    resume_url VARCHAR,
    created_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create Education Table
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    institution VARCHAR NOT NULL,
    degree VARCHAR,
    major VARCHAR,
    gpa VARCHAR,
    start_date VARCHAR,
    end_date VARCHAR
);

-- 5. Create Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    technologies VARCHAR,
    url VARCHAR
);

-- 6. Create Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    level VARCHAR DEFAULT 'Intermediate'
);

-- 7. Create Experience Table
CREATE TABLE experience (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    company VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    description TEXT,
    start_date VARCHAR,
    end_date VARCHAR
);

-- 8. Create Certifications Table
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    issuer VARCHAR,
    issue_date VARCHAR,
    expiry_date VARCHAR,
    url VARCHAR
);

-- 9. Create Career Preferences Table
CREATE TABLE career_preferences (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_roles VARCHAR,
    job_types VARCHAR,
    locations VARCHAR,
    min_salary VARCHAR
);

-- 10. Create Job Analysis Table
CREATE TABLE job_analysis (
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

-- 11. Create or replace the sync function for Supabase Auth
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

-- 12. Create the trigger on the Supabase auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
