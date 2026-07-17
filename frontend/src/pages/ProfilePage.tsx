import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Award, Briefcase, BookOpen, Settings, HelpCircle, CheckCircle2 } from 'lucide-react';
import { profileService } from '../services/api';
import SkillCard from '../components/SkillCard';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basics' | 'education_experience' | 'projects_certs' | 'preferences'>('basics');

  // Unified Profile State
  const [bio, setBio] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    preferred_roles: '',
    job_types: '',
    locations: '',
    min_salary: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setBio(data.bio || '');
        setResumeUrl(data.resume_url || '');
        setEducation(data.education || []);
        setExperience(data.experience || []);
        setProjects(data.projects || []);
        setSkills(data.skills || []);
        setCertifications(data.certifications || []);
        if (data.career_preferences) {
          setPreferences({
            preferred_roles: data.career_preferences.preferred_roles || '',
            job_types: data.career_preferences.job_types || '',
            locations: data.career_preferences.locations || '',
            min_salary: data.career_preferences.min_salary || '',
          });
        }
      } catch (err) {
        console.error("Failed to load profile.", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    const payload = {
      bio,
      resume_url: resumeUrl,
      education,
      experience,
      projects,
      skills,
      certifications,
      career_preferences: preferences,
    };

    try {
      const data = await profileService.updateProfile(payload);
      setSuccessMsg("Master Profile saved successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to save profile.", err);
    } finally {
      setSaving(false);
    }
  };

  // Lists Helpers
  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', major: '', gpa: '', start_date: '', end_date: '' }]);
  };
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const handleEduChange = (index: number, key: string, val: string) => {
    const updated = [...education];
    updated[index][key] = val;
    setEducation(updated);
  };

  const addExperience = () => {
    setExperience([...experience, { company: '', role: '', description: '', start_date: '', end_date: '' }]);
  };
  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const handleExpChange = (index: number, key: string, val: string) => {
    const updated = [...experience];
    updated[index][key] = val;
    setExperience(updated);
  };

  const addProject = () => {
    setProjects([...projects, { title: '', description: '', technologies: '', url: '' }]);
  };
  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };
  const handleProjChange = (index: number, key: string, val: string) => {
    const updated = [...projects];
    updated[index][key] = val;
    setProjects(updated);
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', issue_date: '', expiry_date: '', url: '' }]);
  };
  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };
  const handleCertChange = (index: number, key: string, val: string) => {
    const updated = [...certifications];
    updated[index][key] = val;
    setCertifications(updated);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Master Profile</h2>
          <p className="text-xs text-text-secondary">View and customize details used to evaluate your matching job compatibilities.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-button px-5 py-2.5 text-sm font-bold text-white shadow-glow-primary hover:bg-gradient-button-hover disabled:opacity-50 transition-all shrink-0"
        >
          {saving ? (
            <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? "Saving..." : "Save Master Profile"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400 animate-pulse-slow">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs list container */}
      <div className="flex border-b border-border bg-background/20 p-1 rounded-lg gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'basics' ? 'bg-surface text-accent border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Settings className="h-4 w-4" />
          Basics & Skills
        </button>

        <button
          onClick={() => setActiveTab('education_experience')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'education_experience' ? 'bg-surface text-accent border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Education & Work
        </button>

        <button
          onClick={() => setActiveTab('projects_certs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'projects_certs' ? 'bg-surface text-accent border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Award className="h-4 w-4" />
          Projects & Certs
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            activeTab === 'preferences' ? 'bg-surface text-accent border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Career Preferences
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* BASICS TAB */}
        {activeTab === 'basics' && (
          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Professional Summary
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Bio / Professional Summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself and your professional accomplishments..."
                  rows={5}
                  className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>
            </div>

            <SkillCard skills={skills} onChange={setSkills} />
          </div>
        )}

        {/* EDUCATION & EXPERIENCE TAB */}
        {activeTab === 'education_experience' && (
          <div className="space-y-6">
            {/* Education List */}
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Education Details
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1.5 rounded-lg border border-primary text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/10 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>

              {education.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-4">No education records added. Click Add Education above.</p>
              ) : (
                <div className="space-y-6 divider-y border-border/30">
                  {education.map((edu, index) => (
                    <div key={index} className="space-y-4 pt-4 first:pt-0 relative">
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-text-muted hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Institution Name *</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleEduChange(index, 'institution', e.target.value)}
                            placeholder="e.g. Stanford University"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Field of Study / Major</label>
                          <input
                            type="text"
                            value={edu.major || ''}
                            onChange={(e) => handleEduChange(index, 'major', e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Degree</label>
                          <input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => handleEduChange(index, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1.5 col-span-1">
                            <label className="text-xs font-semibold text-text-secondary">GPA</label>
                            <input
                              type="text"
                              value={edu.gpa || ''}
                              onChange={(e) => handleEduChange(index, 'gpa', e.target.value)}
                              placeholder="e.g. 3.8"
                              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5 col-span-1">
                            <label className="text-xs font-semibold text-text-secondary">Start Date</label>
                            <input
                              type="text"
                              value={edu.start_date || ''}
                              onChange={(e) => handleEduChange(index, 'start_date', e.target.value)}
                              placeholder="e.g. 2020"
                              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5 col-span-1">
                            <label className="text-xs font-semibold text-text-secondary">End Date</label>
                            <input
                              type="text"
                              value={edu.end_date || ''}
                              onChange={(e) => handleEduChange(index, 'end_date', e.target.value)}
                              placeholder="Present"
                              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience List */}
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  Work Experience
                </h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1.5 rounded-lg border border-secondary text-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/10 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Position
                </button>
              </div>

              {experience.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-4">No positions added. Click Add Position above.</p>
              ) : (
                <div className="space-y-6 divider-y border-border/30">
                  {experience.map((exp, index) => (
                    <div key={index} className="space-y-4 pt-4 first:pt-0 relative">
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-2 right-2 text-text-muted hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Company Name *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                            placeholder="e.g. Acme Tech Labs"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Job Title / Role *</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleExpChange(index, 'role', e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Start Date</label>
                          <input
                            type="text"
                            value={exp.start_date || ''}
                            onChange={(e) => handleExpChange(index, 'start_date', e.target.value)}
                            placeholder="e.g. Jan 2021"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">End Date</label>
                          <input
                            type="text"
                            value={exp.end_date || ''}
                            onChange={(e) => handleExpChange(index, 'end_date', e.target.value)}
                            placeholder="Present"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-text-secondary">Job Description / Responsibilities</label>
                          <textarea
                            value={exp.description || ''}
                            onChange={(e) => handleExpChange(index, 'description', e.target.value)}
                            placeholder="Detail your responsibilities and achievements..."
                            rows={3}
                            className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROJECTS & CERTS TAB */}
        {activeTab === 'projects_certs' && (
          <div className="space-y-6">
            {/* Projects List */}
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Key Projects
                </h3>
                <button
                  type="button"
                  onClick={addProject}
                  className="flex items-center gap-1.5 rounded-lg border border-accent text-accent px-3 py-1.5 text-xs font-semibold hover:bg-accent/10 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-4">No projects listed. Click Add Project above.</p>
              ) : (
                <div className="space-y-6 divider-y border-border/30">
                  {projects.map((proj, index) => (
                    <div key={index} className="space-y-4 pt-4 first:pt-0 relative">
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="absolute top-2 right-2 text-text-muted hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Project Title *</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => handleProjChange(index, 'title', e.target.value)}
                            placeholder="e.g. E-Commerce Backend"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Technologies Used</label>
                          <input
                            type="text"
                            value={proj.technologies || ''}
                            onChange={(e) => handleProjChange(index, 'technologies', e.target.value)}
                            placeholder="e.g. React, Python, Docker"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-text-secondary">Project Link URL</label>
                          <input
                            type="text"
                            value={proj.url || ''}
                            onChange={(e) => handleProjChange(index, 'url', e.target.value)}
                            placeholder="https://github.com/yourusername/project"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-text-secondary">Project Description</label>
                          <textarea
                            value={proj.description || ''}
                            onChange={(e) => handleProjChange(index, 'description', e.target.value)}
                            placeholder="Summarize the project accomplishments and details..."
                            rows={3}
                            className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications List */}
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Certifications
                </h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex items-center gap-1.5 rounded-lg border border-purple-400 text-purple-400 px-3 py-1.5 text-xs font-semibold hover:bg-purple-400/10 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Cert
                </button>
              </div>

              {certifications.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-4">No certifications added. Click Add Cert above.</p>
              ) : (
                <div className="space-y-6 divider-y border-border/30">
                  {certifications.map((cert, index) => (
                    <div key={index} className="space-y-4 pt-4 first:pt-0 relative">
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="absolute top-2 right-2 text-text-muted hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Certification Name *</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleCertChange(index, 'name', e.target.value)}
                            placeholder="e.g. AWS Solutions Architect"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Issuing Organization</label>
                          <input
                            type="text"
                            value={cert.issuer || ''}
                            onChange={(e) => handleCertChange(index, 'issuer', e.target.value)}
                            placeholder="e.g. Amazon Web Services"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Issue Date</label>
                          <input
                            type="text"
                            value={cert.issue_date || ''}
                            onChange={(e) => handleCertChange(index, 'issue_date', e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-secondary">Expiry Date</label>
                          <input
                            type="text"
                            value={cert.expiry_date || ''}
                            onChange={(e) => handleCertChange(index, 'expiry_date', e.target.value)}
                            placeholder="e.g. 2027 or N/A"
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-text-secondary">Verification Link URL</label>
                          <input
                            type="text"
                            value={cert.url || ''}
                            onChange={(e) => handleCertChange(index, 'url', e.target.value)}
                            placeholder="https://credly.com/certs/..."
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-accent" />
              Career Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Preferred Roles</label>
                <input
                  type="text"
                  value={preferences.preferred_roles}
                  onChange={(e) => setPreferences({ ...preferences, preferred_roles: e.target.value })}
                  placeholder="e.g. Software Engineer, Fullstack Developer"
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Job Types (e.g., Full-Time, Remote, Contract)</label>
                <input
                  type="text"
                  value={preferences.job_types}
                  onChange={(e) => setPreferences({ ...preferences, job_types: e.target.value })}
                  placeholder="e.g. Full-time, Remote, Contract"
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Preferred Locations</label>
                <input
                  type="text"
                  value={preferences.locations}
                  onChange={(e) => setPreferences({ ...preferences, locations: e.target.value })}
                  placeholder="e.g. New York, Remote"
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Expected Minimum Salary</label>
                <input
                  type="text"
                  value={preferences.min_salary}
                  onChange={(e) => setPreferences({ ...preferences, min_salary: e.target.value })}
                  placeholder="e.g. $90,000 / year"
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default ProfilePage;
