import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Users, History, MessageSquare, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/chatbot', icon: MessageSquare, label: 'AI Help' },
    { path: '/profile', icon: Settings, label: 'Profile' },
  ];
  
  if (user?.role === 'admin') {
    navItems.splice(4, 0, { path: '/admin', icon: Shield, label: 'Admin' });
  }
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 shadow-2xl relative pb-20">
        {/* Main Content */}
        <main className="h-full">
          <Outlet />
        </main>
        
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                    active 
                      ? 'text-red-600 dark:text-red-500' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-xs mt-1 ${active ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
