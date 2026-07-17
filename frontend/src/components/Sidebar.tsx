import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, UploadCloud, Cpu, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Master Profile', path: '/profile', icon: User },
    { name: 'Resume Parser', path: '/resume-upload', icon: UploadCloud },
    { name: 'Job Analysis', path: '/job-analysis', icon: Cpu },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-border bg-background/40 md:h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Navigation
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-button text-white shadow-glow-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-border/30'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 md:mt-0 pt-4 border-t border-border/50">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
