import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, UploadCloud, UserCheck, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  user: any;
}

const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl animate-ping" style={{ animationDuration: '6s' }}></div>

      <div className="max-w-4xl text-center space-y-8 z-10">
        {/* Badge header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-border/80 border border-primary/20 text-xs font-semibold text-primary animate-bounce">
          <Cpu className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
          Powered by Groq & Llama 3
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
          Supercharge Your Job Search with <br />
          <span className="text-gradient font-black">Intelligent AI Automation</span>
        </h1>

        {/* Hero text */}
        <p className="max-w-2xl mx-auto text-lg text-text-secondary">
          Upload your resume, let AI parse the details in milliseconds to populate your master profile, and analyze target job descriptions to extract ATS keywords, required experiences, and responsibilities.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={user ? "/dashboard" : "/login"}
            className="flex items-center gap-2 rounded-xl bg-gradient-button px-6 py-3 text-base font-bold text-white shadow-glow-primary hover:bg-gradient-button-hover transition-all"
          >
            <span>{user ? "Go to Dashboard" : "Get Started Now"}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-border bg-surface/50 px-6 py-3 text-base font-semibold text-text-secondary hover:text-text-primary hover:bg-border/30 transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Grid features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Instant Resume Parsing</h3>
            <p className="text-sm text-text-secondary">
              Upload PDF or Word documents. Llama 3 parses credentials, education, projects, and skills to form your master profile.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20">
              <Cpu className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">ATS Requirement Extraction</h3>
            <p className="text-sm text-text-secondary">
              Paste descriptions or enter job page URLs. AI analyzes required certifications, roles, responsibilities, and preferred skills.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
              <UserCheck className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Master Profile Manager</h3>
            <p className="text-sm text-text-secondary">
              Maintain dynamic, editable information for work histories, project repositories, certificates, and salary expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
