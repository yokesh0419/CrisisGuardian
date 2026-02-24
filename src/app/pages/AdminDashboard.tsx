import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, MapPin, Activity, TrendingUp, CheckCircle, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '../contexts/EmergencyContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Navigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MultiLocationMap } from '../components/LocationMap';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [globalAlerts, setGlobalAlerts] = useState<Alert[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  
  useEffect(() => {
    // Load global alerts from localStorage
    const alerts = JSON.parse(localStorage.getItem('globalAlerts') || '[]');
    setGlobalAlerts(alerts.sort((a: Alert, b: Alert) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
    
    // Load total users
    const users = JSON.parse(localStorage.getItem('crisisGuardianUsers') || '[]');
    setTotalUsers(users.length + 1); // +1 for admin
  }, []);
  
  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  const activeAlerts = globalAlerts.filter(a => a.status === 'active');
  const highRiskAlerts = globalAlerts.filter(a => a.riskLevel === 'high');
  const last24Hours = globalAlerts.filter(a => 
    new Date().getTime() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000
  );
  
  // Prepare map locations
  const mapLocations = globalAlerts.slice(0, 50).map(alert => ({
    id: alert.id,
    latitude: alert.location.latitude,
    longitude: alert.location.longitude,
    label: `Alert #${alert.id.slice(-8)} - ${alert.status}`,
    timestamp: alert.timestamp,
    riskLevel: alert.riskLevel
  }));
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950/30 p-4 pb-20">
      {/* Header */}
      <div className="mb-6 pt-4">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Real-time monitoring and system overview
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Users size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalUsers}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total Users
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeAlerts.length}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Active Alerts
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <TrendingUp size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {last24Hours.length}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Last 24h
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Activity size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {globalAlerts.length}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total Alerts
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* High Risk Alerts */}
      {highRiskAlerts.length > 0 && (
        <Card className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              High Risk Alerts
            </h2>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {highRiskAlerts.length}
            </Badge>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {highRiskAlerts.length} user{highRiskAlerts.length !== 1 ? 's' : ''} in high-risk areas requiring immediate attention
          </p>
        </Card>
      )}
      
      {/* Recent Alerts */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          System Overview
        </h2>
      </div>
      
      {globalAlerts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full inline-block mb-4">
            <CheckCircle size={48} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Alerts
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            All systems running smoothly. No emergency alerts to display.
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">
              <Activity size={16} className="mr-2" />
              Alert List
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon size={16} className="mr-2" />
              Alert Map
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-3">
            {globalAlerts.slice(0, 20).map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Emergency Alert #{alert.id.slice(-8)}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                      {alert.type} trigger • User: {alert.userId.slice(-8)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getRiskColor(alert.riskLevel)}>
                      {alert.riskLevel.toUpperCase()}
                    </Badge>
                    {alert.status === 'active' ? (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-300 text-xs truncate">
                        {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {format(new Date(alert.timestamp), 'MMM dd, hh:mm a')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {alert.contactsNotified.length} emergency contact{alert.contactsNotified.length !== 1 ? 's' : ''} notified
                  </p>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="map">
            <div className="mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {Math.min(mapLocations.length, 50)} most recent alerts on map
              </p>
            </div>
            <MultiLocationMap locations={mapLocations} height="500px" zoom={10} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};