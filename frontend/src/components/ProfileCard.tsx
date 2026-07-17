import React from 'react';
import { User, BookOpen, Briefcase, Code, Award, CheckCircle } from 'lucide-react';

interface ProfileCardProps {
  profile: any;
  user: any;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, user }) => {
  // Calculate completeness score
  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.bio) score += 15;
    if (profile.education && profile.education.length > 0) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 20;
    if (profile.projects && profile.projects.length > 0) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.certifications && profile.certifications.length > 0) score += 15;
    return score;
  };

  const completeness = calculateCompleteness();

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative gradient corner */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/20 blur-xl"></div>

      <div>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-button shadow-glow-primary border border-white/10 text-white font-extrabold text-2xl">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {user?.full_name || 'Set Your Name'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">{user?.email}</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mt-4 line-clamp-3 italic">
          {profile?.bio || '"Add a professional bio or upload a resume to let our AI auto-generate your summary details."'}
        </p>

        {/* Dynamic statistics */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{profile?.education?.length || 0} Education items</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Briefcase className="h-4 w-4 text-secondary" />
            <span>{profile?.experience?.length || 0} Jobs</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Code className="h-4 w-4 text-accent" />
            <span>{profile?.projects?.length || 0} Projects</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Award className="h-4 w-4 text-purple-400" />
            <span>{profile?.certifications?.length || 0} Certs</span>
          </div>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="mt-8 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-text-primary mb-1.5">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-accent" />
            Profile Completeness
          </span>
          <span className="text-accent">{completeness}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-gradient-button transition-all duration-500 ease-out"
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
