import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertTriangle, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';

interface RegisterPageProps {
  onLogin: (token: string, user: any) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Register User
      await authService.register({
        email,
        password,
        full_name: fullName,
      });

      // 2. Auto-login on success
      const data = await authService.login({ email, password });
      onLogin(data.access_token, {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block text-3xl font-extrabold tracking-tight text-text-primary">
            Job<span className="text-gradient font-black">AI</span>
          </Link>
          <p className="text-sm text-text-secondary">Create your account and build your Master Profile</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 space-y-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-button px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-gradient-button-hover disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>{loading ? "Registering..." : "Create Account"}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold flex inline-flex items-center gap-1">
            Sign In <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
