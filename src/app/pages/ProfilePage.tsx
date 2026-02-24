import React from 'react';
import { useNavigate } from 'react-router';
import { User, Phone, Mail, Shield, LogOut, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-950 dark:to-teal-950/30 p-4 pb-20">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile & Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage your account information
        </p>
      </div>
      
      {/* Profile Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <User size={36} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {user?.email}
            </p>
            {user?.role === 'admin' && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Shield size={12} className="mr-1" />
                Administrator
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Mail size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
              <p className="text-sm text-slate-900 dark:text-white">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Phone size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Phone</p>
              <p className="text-sm text-slate-900 dark:text-white">{user?.phone}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* App Information */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={20} className="text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            About Crisis Guardian
          </h3>
        </div>
        
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              Version
            </p>
            <p>1.0.0 Beta</p>
          </div>
          
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              Features
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>GPS Location Tracking</li>
              <li>Emergency Contact Management</li>
              <li>One-Tap SOS Alert</li>
              <li>Voice-Activated SOS</li>
              <li>AI-Powered Risk Detection</li>
              <li>Emergency Chatbot Guidance</li>
              <li>Alert History Tracking</li>
              <li>Admin Monitoring (Admin Only)</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              Technology Stack
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>React 18 with TypeScript</li>
              <li>React Router for Navigation</li>
              <li>Geolocation API</li>
              <li>Speech Recognition API</li>
              <li>LocalStorage for Data Persistence</li>
              <li>AI/ML Logic for Risk Assessment</li>
              <li>NLP for Chatbot Intelligence</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Demo Information */}
      <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold mb-2">Demo Version</p>
            <p>
              This is a frontend demonstration of the Crisis Guardian emergency safety system. 
              In a production environment, this would be connected to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Real-time database (MongoDB/PostgreSQL)</li>
              <li>Authentication server (JWT/OAuth)</li>
              <li>SMS/Email notification services</li>
              <li>Real crime data APIs</li>
              <li>Emergency services integration</li>
              <li>Advanced AI/ML models</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut size={18} className="mr-2" />
        Logout
      </Button>
    </div>
  );
};
