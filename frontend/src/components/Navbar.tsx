import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Briefcase } from 'lucide-react';

interface NavbarProps {
  user: { full_name?: string; email?: string } | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-button shadow-glow-primary">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-text-primary">
            Job<span className="text-gradient font-black">AI</span>
          </span>
        </Link>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-text-primary">
                  {user.full_name || 'Job Applicant'}
                </span>
                <span className="text-xs text-text-secondary">
                  {user.email}
                </span>
              </div>

              {/* Avatar circle */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-border text-primary font-bold border border-primary/30">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>

              {/* Logout button in navbar for mobile / utility */}
              <button
                onClick={onLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-red-400 hover:border-red-400/30 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-button px-4 py-2 text-sm font-medium text-white shadow-glow-primary hover:bg-gradient-button-hover transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
