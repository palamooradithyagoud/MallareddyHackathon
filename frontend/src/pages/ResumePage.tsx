import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Cpu, CheckCircle2, ChevronRight, User, GraduationCap, Briefcase, Code, Award, Sliders } from 'lucide-react';
import ResumeUploadCard from '../components/ResumeUploadCard';
import LoadingScreen from '../components/LoadingScreen';
import { profileService } from '../services/api';

const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load profile to fetch any currently uploaded resume URL
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile for resume details:", err);
      }
    };
    loadProfile();
  }, []);

  const handleUploadSuccess = (url: string) => {
    setProfile((prev: any) => ({ ...prev, resume_url: url }));
    setParsedResult(null);
    setErrorMsg(null);
  };

  const handleParseStart = () => {
    setParsing(true);
    setParsedResult(null);
    setErrorMsg(null);
  };

  const handleParseSuccess = (data: any) => {
    setParsing(false);
    setParsedResult(data);
  };

  const handleParseError = (err: string) => {
    setParsing(false);
    setErrorMsg(err);
  };

  return (
    <div className="space-y-6 max-w-full">
      {parsing && (
        <LoadingScreen
          message="AI Resume Parsing in Progress"
          subMessage="Groq LLM is scanning file text to extract key information and populate database tables..."
        />
      )}

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">AI Resume Parser</h2>
        <p className="text-xs text-text-secondary">Upload a file to automatically fill in your entire master profile using Llama 3.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Upload Panel */}
        <div className="lg:col-span-1">
          <ResumeUploadCard
            currentResumeUrl={profile?.resume_url || null}
            onUploadSuccess={handleUploadSuccess}
            onParseStart={handleParseStart}
            onParseSuccess={handleParseSuccess}
            onParseError={handleParseError}
          />
        </div>

        {/* Right Column: Parsed Results Preview / Explanation */}
        <div className="lg:col-span-2">
          {errorMsg && (
            <div className="glass-panel border-red-500/20 bg-red-500/5 rounded-xl p-6 text-center space-y-3">
              <p className="text-sm text-red-400 font-semibold">Parsing Failed</p>
              <p className="text-xs text-text-secondary">{errorMsg}</p>
            </div>
          )}

          {parsedResult ? (
            <div className="space-y-6">
              {/* Success Badge */}
              <div className="glass-panel border-green-500/20 bg-green-500/5 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Parse Completed Successfully!</h4>
                    <p className="text-xs text-text-secondary">Master profile tables have been populated.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  Edit Master Profile
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Preview Cards */}
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-3">
                  <FileText className="h-5 w-5 text-accent" />
                  Extracted Database Entries Preview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name & Summary */}
                  <div className="space-y-1.5 md:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Name & Bio
                    </span>
                    <h4 className="text-sm font-bold text-text-primary">{parsedResult.name}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed italic">{parsedResult.bio}</p>
                  </div>

                  {/* Education */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" /> Education
                    </span>
                    {parsedResult.education?.length === 0 ? (
                      <p className="text-xs text-text-muted italic">None extracted.</p>
                    ) : (
                      <ul className="space-y-2">
                        {parsedResult.education?.map((edu: any, i: number) => (
                          <li key={i} className="text-xs border-l-2 border-primary/50 pl-2">
                            <span className="font-semibold text-text-primary">{edu.institution}</span>
                            <span className="block text-text-secondary mt-0.5">{edu.degree} in {edu.major} ({edu.end_date})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-secondary" /> Experience
                    </span>
                    {parsedResult.experience?.length === 0 ? (
                      <p className="text-xs text-text-muted italic">None extracted.</p>
                    ) : (
                      <ul className="space-y-2">
                        {parsedResult.experience?.map((exp: any, i: number) => (
                          <li key={i} className="text-xs border-l-2 border-secondary/50 pl-2">
                            <span className="font-semibold text-text-primary">{exp.company}</span>
                            <span className="block text-text-secondary mt-0.5">{exp.role} ({exp.start_date} - {exp.end_date})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-accent" /> Extracted Skills
                    </span>
                    {parsedResult.skills?.length === 0 ? (
                      <p className="text-xs text-text-muted italic">None extracted.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {parsedResult.skills?.map((s: any, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20"
                          >
                            {s.name} ({s.level})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Projects */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-purple-400" /> Projects
                    </span>
                    {parsedResult.projects?.length === 0 ? (
                      <p className="text-xs text-text-muted italic">None extracted.</p>
                    ) : (
                      <ul className="space-y-2">
                        {parsedResult.projects?.map((proj: any, i: number) => (
                          <li key={i} className="text-xs border-l-2 border-purple-400/50 pl-2">
                            <span className="font-semibold text-text-primary">{proj.title}</span>
                            <span className="block text-text-secondary mt-0.5 truncate">{proj.technologies}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Preferences */}
                  {parsedResult.career_preferences && (
                    <div className="space-y-3 md:col-span-2 border-t border-border/50 pt-4">
                      <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-accent" /> Extracted Career Focus
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-text-muted block">Preferred Roles</span>
                          <span className="text-text-primary font-semibold">{parsedResult.career_preferences.preferred_roles || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted block">Job Types</span>
                          <span className="text-text-primary font-semibold">{parsedResult.career_preferences.job_types || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted block">Preferred Locations</span>
                          <span className="text-text-primary font-semibold">{parsedResult.career_preferences.locations || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted block">Min Salary Target</span>
                          <span className="text-text-primary font-semibold">{parsedResult.career_preferences.min_salary || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-8 text-center space-y-4 border border-dashed border-border/60 bg-background/5 h-full flex flex-col justify-center items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-sm font-bold text-text-primary">Parsed Preview Area</h4>
                <p className="text-xs text-text-secondary">
                  When you upload your resume and trigger "AI Parse Resume", the structured Llama-3 extraction will appear here for verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
