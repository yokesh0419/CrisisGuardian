import React from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, CheckCircle, AlertTriangle, Activity, Map as MapIcon } from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MultiLocationMap } from '../components/LocationMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export const AlertHistoryPage: React.FC = () => {
  const { alerts, resolveAlert } = useEmergency();
  
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
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return '🎤';
      case 'automatic':
        return '🤖';
      default:
        return '👆';
    }
  };
  
  // Prepare location data for map
  const mapLocations = alerts.map(alert => ({
    id: alert.id,
    latitude: alert.location.latitude,
    longitude: alert.location.longitude,
    label: `Alert #${alert.id.slice(-8)}`,
    timestamp: alert.timestamp,
    riskLevel: alert.riskLevel
  }));
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950/30 p-4 pb-20">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Alert History
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {alerts.length} total alert{alerts.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {alerts.filter(a => a.status === 'active').length}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Active
          </p>
        </Card>
        
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {alerts.filter(a => a.status === 'resolved').length}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Resolved
          </p>
        </Card>
        
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {alerts.filter(a => a.riskLevel === 'high').length}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            High Risk
          </p>
        </Card>
      </div>
      
      {/* Tabs for List and Map View */}
      {alerts.length > 0 ? (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">
              <Activity size={16} className="mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon size={16} className="mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            {/* Alerts List */}
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Emergency Alert
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                        {alert.type} trigger
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getRiskColor(alert.riskLevel)}>
                      {alert.riskLevel.toUpperCase()}
                    </Badge>
                    {alert.status === 'active' ? (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <AlertTriangle size={12} className="mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle size={12} className="mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Clock size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {format(new Date(alert.timestamp), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {format(new Date(alert.timestamp), 'hh:mm:ss a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        Lat: {alert.location.latitude.toFixed(6)}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        Long: {alert.location.longitude.toFixed(6)}
                      </p>
                      {alert.location.address && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                          {alert.location.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {alert.contactsNotified.length} contact{alert.contactsNotified.length !== 1 ? 's' : ''} notified
                  </p>
                  
                  {alert.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="map" className="h-[500px]">
            {/* Map View */}
            <MultiLocationMap locations={mapLocations} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
            <Activity size={48} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Alert History
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-xs">
            Your emergency alerts will appear here when you trigger an SOS
          </p>
        </div>
      )}
    </div>
  );
};