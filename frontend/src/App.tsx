import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import JobPage from './pages/JobPage';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [token]);

  const handleLogin = (tokenStr: string, userData: any) => {
    localStorage.setItem('token', tokenStr);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <span className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  // Router layout for dashboard pages
  const DashboardLayout = () => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen bg-gradient-main flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
          <Sidebar onLogout={handleLogout} />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-full">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-main flex flex-col">
            <Navbar user={user} onLogout={handleLogout} />
            <LandingPage user={user} />
          </div>
        } />
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resume-upload" element={<ResumePage />} />
          <Route path="/job-analysis" element={<JobPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
