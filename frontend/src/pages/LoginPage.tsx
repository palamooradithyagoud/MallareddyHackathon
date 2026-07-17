import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertTriangle, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to decode JWT payloads in client space without dependencies
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Check URL hash fragment for Supabase OAuth redirect parameters
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          setLoading(true);
          setErrorMsg(null);
          try {
            const payload = decodeJwt(accessToken);
            if (payload) {
              const googleEmail = payload.email;
              const googleName = payload.user_metadata?.full_name || payload.user_metadata?.name || googleEmail.split('@')[0];
              
              // Register/login in our application DB
              const data = await authService.googleLogin({
                credential: accessToken,
                email: googleEmail,
                full_name: googleName
              });
              
              // Clean URL hash so refreshing doesn't re-trigger OAuth callback
              window.history.replaceState(null, '', window.location.pathname);
              
              onLogin(data.access_token, {
                id: data.user_id,
                email: data.email,
                full_name: data.full_name,
              });
              navigate('/dashboard');
            } else {
              throw new Error("Unable to parse identity token");
            }
          } catch (err: any) {
            console.error("OAuth Callback Error:", err);
            setErrorMsg("Google authentication failed. Please try again.");
          } finally {
            setLoading(false);
          }
        }
      }
    };
    handleOAuthCallback();
  }, [navigate, onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await authService.login({ email, password });
      onLogin(data.access_token, {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setErrorMsg(null);
    
    // Redirect browser to your Supabase project Google Auth gateway
    const supabaseUrl = "https://szogxxuppqsnybefaptq.supabase.co";
    const redirectTo = encodeURIComponent(window.location.origin + "/login");
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  };

  return (
    <div className="min-h-screen bg-gradient-main flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Glow filters */}
      <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block text-3xl font-extrabold tracking-tight text-text-primary">
            Job<span className="text-gradient font-black">AI</span>
          </Link>
          <p className="text-sm text-text-secondary">Welcome back! Sign in to access your dashboard</p>
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
                  placeholder="••••••••"
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
                <LogIn className="h-4 w-4" />
              )}
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="flex-shrink mx-4 text-text-muted text-xs font-medium uppercase">Or</span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-background/30 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-border/30 transition-all"
          >
            {/* Google Logo vector */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.62v3.01h3.87c2.26-2.08 3.58-5.15 3.58-8.48z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3.01c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-4.99H1.27v3.11C3.25 21.3 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.25c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31V6.51H1.27C.46 8.16 0 10.02 0 12s.46 3.84 1.27 5.49l3.97-3.24z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.25 2.7 1.27 6.51l3.97 3.24c.95-2.86 3.61-4.99 6.76-4.99z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-xs text-text-secondary">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-semibold flex inline-flex items-center gap-1">
            Sign Up <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
