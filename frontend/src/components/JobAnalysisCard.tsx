import React, { useState } from 'react';
import { Cpu, Link as LinkIcon, FileText, AlertTriangle } from 'lucide-react';
import { jobService } from '../services/api';

interface JobAnalysisCardProps {
  onAnalysisStart: () => void;
  onAnalysisSuccess: (data: any) => void;
  onAnalysisError: (err: string) => void;
}

const JobAnalysisCard: React.FC<JobAnalysisCardProps> = ({
  onAnalysisStart,
  onAnalysisSuccess,
  onAnalysisError,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: { job_description?: string; job_url?: string } = {};
    if (activeTab === 'text') {
      if (!jobDescription.trim()) {
        setErrorMsg("Please paste a job description first.");
        return;
      }
      payload.job_description = jobDescription;
    } else {
      if (!jobUrl.trim()) {
        setErrorMsg("Please enter a valid job URL first.");
        return;
      }
      if (!jobUrl.startsWith('http://') && !jobUrl.startsWith('https://')) {
        setErrorMsg("URL must start with http:// or https://");
        return;
      }
      payload.job_url = jobUrl;
    }

    setLoading(true);
    onAnalysisStart();

    try {
      const data = await jobService.analyzeJob(payload);
      onAnalysisSuccess(data);
      // Reset inputs on success
      setJobDescription('');
      setJobUrl('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Job analysis failed.";
      setErrorMsg(msg);
      onAnalysisError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Cpu className="h-5 w-5 text-secondary" />
          AI Job Description Analyzer
        </h3>
        <p className="text-xs text-text-secondary">
          Analyze job requirements, responsibilities, and key ATS keywords instantly to optimize your application.
        </p>

        {/* Tab Selector */}
        <div className="flex rounded-lg bg-background p-1 border border-border">
          <button
            type="button"
            onClick={() => { setActiveTab('text'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'text'
                ? 'bg-surface text-accent shadow-sm shadow-black/30 border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'url'
                ? 'bg-surface text-accent shadow-sm shadow-black/30 border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Job URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'text' ? (
            <div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the entire job description here..."
                rows={7}
                className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://example.com/jobs/software-engineer"
                className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-button px-4 py-2.5 text-sm font-semibold text-white shadow-glow-secondary hover:bg-gradient-button-hover disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : (
              <Cpu className="h-4 w-4" />
            )}
            <span>{loading ? "Analyzing..." : "Analyze Job Details"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobAnalysisCard;
