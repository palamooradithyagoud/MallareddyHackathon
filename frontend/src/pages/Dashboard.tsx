import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Cpu, UploadCloud, UserCheck, Calendar, MapPin, Building } from 'lucide-react';
import { profileService, jobService } from '../services/api';
import ProfileCard from '../components/ProfileCard';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileData = await profileService.getProfile();
        setProfile(profileData);

        const historyData = await jobService.getHistory();
        setHistory(historyData.slice(0, 3)); // Display top 3 recent jobs
      } catch (err) {
        console.error("Error loading dashboard details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-card border border-border p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-secondary/15 blur-2xl"></div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back, <span className="text-gradient">{user?.full_name || 'Job Seeker'}</span>!
          </h2>
          <p className="text-sm text-text-secondary max-w-xl">
            Optimize your application details today. Start by uploading a resume or pasting a new job description to extract core competencies.
          </p>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} user={user} />
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Phase 1 Quick Actions</h3>
            <p className="text-xs text-text-secondary">Explore AI features implemented in this build.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/resume-upload"
                className="flex items-center gap-4 rounded-xl border border-border bg-background/30 p-4 hover:border-primary/50 hover:bg-border/20 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors flex items-center gap-1">
                    Upload Resume
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">AI-parse file and sync master profile.</p>
                </div>
              </Link>

              <Link
                to="/job-analysis"
                className="flex items-center gap-4 rounded-xl border border-border bg-background/30 p-4 hover:border-secondary/50 hover:bg-border/20 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary group-hover:text-secondary transition-colors flex items-center gap-1">
                    Job Description Analyzer
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">Extract required skills & ATS keywords.</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
            <span>Supabase Database State: <span className="text-accent font-semibold">Active</span></span>
            <Link to="/profile" className="text-primary hover:underline font-semibold flex items-center gap-1">
              Edit Profile Details <UserCheck className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity / Jobs */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Recent Job Analyses</h3>
          <Link
            to="/job-analysis"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-background/10 p-8 text-center text-text-muted text-sm italic">
            You haven't analyzed any jobs yet. Paste your first job description or URL to track them here!
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background/25 p-4 hover:border-secondary/30 transition-all gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
                    <Building className="h-4 w-4 text-secondary shrink-0" />
                    {job.role}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-text-muted" />
                      {job.company}
                    </span>
                    {job.experience_required && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-text-muted" />
                        {job.experience_required}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {job.ats_keywords?.slice(0, 3).map((kw: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      {kw}
                    </span>
                  ))}
                  {job.ats_keywords?.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-border text-text-secondary">
                      +{job.ats_keywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
