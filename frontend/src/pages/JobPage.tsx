import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Building, Briefcase, Award, GraduationCap, CheckSquare, Sparkles } from 'lucide-react';
import JobAnalysisCard from '../components/JobAnalysisCard';
import LoadingScreen from '../components/LoadingScreen';

const JobPage: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalysisStart = () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleAnalysisSuccess = (data: any) => {
    setAnalyzing(false);
    setAnalysisResult(data);
  };

  const handleAnalysisError = (err: string) => {
    setAnalyzing(false);
    setErrorMsg(err);
  };

  return (
    <div className="space-y-6 max-w-full">
      {analyzing && (
        <LoadingScreen
          message="Analyzing Job Specifications"
          subMessage="Scraping webpage (if URL) and sending details to Groq AI model for ATS analysis..."
        />
      )}

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">AI Job Description Analyzer</h2>
        <p className="text-xs text-text-secondary">Paste a job description text or input a URL to inspect core required competencies and ATS keywords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-1">
          <JobAnalysisCard
            onAnalysisStart={handleAnalysisStart}
            onAnalysisSuccess={handleAnalysisSuccess}
            onAnalysisError={handleAnalysisError}
          />
        </div>

        {/* Right Column: Analysis Results Preview */}
        <div className="lg:col-span-2">
          {errorMsg && (
            <div className="glass-panel border-red-500/20 bg-red-500/5 rounded-xl p-6 text-center space-y-3">
              <p className="text-sm text-red-400 font-semibold">Analysis Failed</p>
              <p className="text-xs text-text-secondary">{errorMsg}</p>
            </div>
          )}

          {analysisResult ? (
            <div className="space-y-6">
              {/* Job Header Summary */}
              <div className="glass-panel rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> AI Analysis Complete
                  </span>
                  <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-secondary" />
                    {analysisResult.role}
                  </h3>
                  <p className="text-sm text-text-secondary flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-text-muted" />
                    {analysisResult.company}
                  </p>
                </div>
              </div>

              {/* Detailed requirements cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Required Skills */}
                <div className="glass-panel rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                    Required Skills
                  </h4>
                  {analysisResult.required_skills?.length === 0 ? (
                    <p className="text-xs text-text-muted italic">None specified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.required_skills?.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold glow-tag-blue"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferred Skills */}
                <div className="glass-panel rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                    <Award className="h-4.5 w-4.5 text-secondary" />
                    Preferred Skills
                  </h4>
                  {analysisResult.preferred_skills?.length === 0 ? (
                    <p className="text-xs text-text-muted italic">None specified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.preferred_skills?.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold glow-tag-purple"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education and Experience Requirements */}
                <div className="glass-panel rounded-xl p-5 space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                    <GraduationCap className="h-4.5 w-4.5 text-accent" />
                    Qualifications & Criteria
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase">Education Required</span>
                      <p className="text-xs text-text-primary leading-relaxed">
                        {analysisResult.education_required || "Not explicitly specified."}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase">Experience Required</span>
                      <p className="text-xs text-text-primary leading-relaxed">
                        {analysisResult.experience_required || "Not explicitly specified."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Responsibilities list */}
                <div className="glass-panel rounded-xl p-5 space-y-3 md:col-span-2">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                    <CheckSquare className="h-4.5 w-4.5 text-primary" />
                    Key Responsibilities
                  </h4>
                  {analysisResult.responsibilities?.length === 0 ? (
                    <p className="text-xs text-text-muted italic">None extracted.</p>
                  ) : (
                    <ul className="space-y-2 pt-1">
                      {analysisResult.responsibilities?.map((item: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-xs text-text-secondary leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ATS Keywords Glow tags */}
                <div className="glass-panel rounded-xl p-5 space-y-3 md:col-span-2">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                    <Cpu className="h-4.5 w-4.5 text-accent" />
                    ATS Keywords for Resume Optimization
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    Add these terms/phrases to your resume to increase compatibility scores in applicant tracking search engines.
                  </p>
                  {analysisResult.ats_keywords?.length === 0 ? (
                    <p className="text-xs text-text-muted italic">None identified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysisResult.ats_keywords?.map((keyword: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/5 text-accent border border-accent/20 hover:border-accent/40 shadow-sm transition-all"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-8 text-center space-y-4 border border-dashed border-border/60 bg-background/5 h-full flex flex-col justify-center items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                <Cpu className="h-6 w-6 animate-pulse-slow" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-sm font-bold text-text-primary">Analysis Output Panel</h4>
                <p className="text-xs text-text-secondary">
                  When you submit a job details form, Llama 3 will run a full evaluation here, splitting responsibilities, ATS tags, and criteria.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPage;
