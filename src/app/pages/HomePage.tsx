import React, { useState, useEffect } from 'react';
import { MapPin, Mic, MicOff, AlertCircle, Shield, Navigation, Map } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useEmergency } from '../contexts/EmergencyContext';
import { toast } from 'sonner';
import { processVoiceCommand } from '../utils/aiHelpers';
import { assessLocationRisk, RiskAssessment } from '../utils/aiHelpers';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { LocationMap } from '../components/LocationMap';
import { Button } from '../components/ui/button';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { triggerSOS, currentLocation, locationError } = useEmergency();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [showMap, setShowMap] = useState(true);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Voice command:', transcript);
        
        const { isSOSCommand, confidence } = processVoiceCommand(transcript);
        
        if (isSOSCommand) {
          toast.success(`Voice SOS detected (${confidence.toFixed(0)}% confidence)`);
          handleSOSTrigger('voice');
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
  // Assess location risk
  useEffect(() => {
    if (currentLocation) {
      const assessment = assessLocationRisk({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      setRiskAssessment(assessment);
    }
  }, [currentLocation]);
  
  const handleSOSTrigger = async (type: 'manual' | 'voice' = 'manual') => {
    if (!currentLocation) {
      toast.error('Unable to get your location');
      return;
    }
    
    setIsSOSActive(true);
    
    try {
      await triggerSOS(type, currentLocation);
      toast.success('🚨 SOS Alert Sent!', {
        description: 'Emergency contacts have been notified with your location.'
      });
      
      // Simulate alert sound
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      
      setTimeout(() => setIsSOSActive(false), 3000);
    } catch (error) {
      toast.error('Failed to send SOS alert');
      setIsSOSActive(false);
    }
  };
  
  const toggleVoiceAssistant = () => {
    if (!recognition) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast.info('Voice assistant stopped');
    } else {
      recognition.start();
      setIsListening(true);
      toast.success('Voice assistant listening... Say "SOS" or "Help" to trigger emergency');
    }
  };
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-red-950/30 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Crisis Guardian
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Welcome, {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentLocation && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin size={12} />
              GPS Active
            </Badge>
          )}
        </div>
      </div>
      
      {/* Location Risk Assessment */}
      {riskAssessment && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 border-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Location Risk Assessment
                </h3>
              </div>
              <Badge className={getRiskColor(riskAssessment.riskLevel)}>
                {riskAssessment.riskLevel.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Risk Score: {riskAssessment.riskScore}/100
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      riskAssessment.riskLevel === 'high' ? 'bg-red-600' :
                      riskAssessment.riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${riskAssessment.riskScore}%` }}
                  />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Risk Factors:
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                  {riskAssessment.factors.map((factor, index) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Safety Recommendations:
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                  {riskAssessment.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* Location Display */}
      {currentLocation && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Navigation size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Current Location
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lat: {currentLocation.coords.latitude.toFixed(6)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Long: {currentLocation.coords.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Accuracy: ±{currentLocation.coords.accuracy.toFixed(0)}m
              </p>
            </div>
          </div>
        </div>
      )}
      
      {locationError && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                Location Error
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {locationError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* SOS Button */}
      <div className="flex items-center justify-center py-12">
        <motion.button
          onClick={() => handleSOSTrigger('manual')}
          disabled={isSOSActive}
          className="relative"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              boxShadow: isSOSActive
                ? [
                    '0 0 0 0 rgba(239, 68, 68, 0.7)',
                    '0 0 0 40px rgba(239, 68, 68, 0)',
                  ]
                : '0 0 40px 0 rgba(239, 68, 68, 0.3)',
            }}
            transition={{
              duration: 1.5,
              repeat: isSOSActive ? Infinity : 0,
              repeatType: 'loop',
            }}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center shadow-2xl"
          >
            <div className="text-center">
              <p className="text-white text-6xl font-bold mb-2">SOS</p>
              <p className="text-white text-sm opacity-90">
                {isSOSActive ? 'Alert Sending...' : 'Tap to Send Alert'}
              </p>
            </div>
          </motion.div>
        </motion.button>
      </div>
      
      {/* Voice Assistant Toggle */}
      <div className="mt-8">
        <button
          onClick={toggleVoiceAssistant}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            isListening
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {isListening ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mic size={20} />
                </motion.div>
                Listening for Voice Commands...
              </>
            ) : (
              <>
                <MicOff size={20} />
                Enable Voice Assistant
              </>
            )}
          </div>
        </button>
        
        {isListening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center text-slate-600 dark:text-slate-400 mt-2"
          >
            Say "SOS", "Help", "Emergency", or "Danger" to trigger alert
          </motion.p>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentLocation ? '24/7' : '---'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            GPS Tracking
          </p>
        </Card>
        
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            AI
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Powered Safety
          </p>
        </Card>
      </div>
      
      {/* Map Toggle */}
      <div className="mt-8">
        <Button
          onClick={() => setShowMap(!showMap)}
          className="w-full py-4 rounded-xl font-semibold transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            {showMap ? (
              <>
                <Map size={20} />
                Hide Map
              </>
            ) : (
              <>
                <Map size={20} />
                Show Map
              </>
            )}
          </div>
        </Button>
      </div>
      
      {/* Map Display */}
      {showMap && currentLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Live Location Map
            </h3>
          </div>
          <LocationMap
            latitude={currentLocation.coords.latitude}
            longitude={currentLocation.coords.longitude}
            accuracy={currentLocation.coords.accuracy}
            zoom={16}
            height="350px"
            showAccuracyCircle={true}
            markerLabel="Your Current Location"
          />
        </motion.div>
      )}
    </div>
  );
};