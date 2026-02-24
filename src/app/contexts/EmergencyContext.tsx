import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  type: 'manual' | 'voice' | 'automatic';
  riskLevel: 'low' | 'medium' | 'high';
  contactsNotified: string[];
  status: 'active' | 'resolved';
}

interface EmergencyContextType {
  contacts: EmergencyContact[];
  alerts: Alert[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateContact: (id: string, contact: Omit<EmergencyContact, 'id'>) => void;
  deleteContact: (id: string) => void;
  triggerSOS: (type: 'manual' | 'voice' | 'automatic', location: GeolocationPosition) => Promise<void>;
  resolveAlert: (id: string) => void;
  currentLocation: GeolocationPosition | null;
  locationError: string | null;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within EmergencyProvider');
  }
  return context;
};

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load contacts and alerts from localStorage
  useEffect(() => {
    if (user) {
      const storedContacts = localStorage.getItem(`contacts_${user.id}`);
      const storedAlerts = localStorage.getItem(`alerts_${user.id}`);
      
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      }
    }
  }, [user]);

  // Track location
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation(position);
          setLocationError(null);
        },
        (error) => {
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }
  }, []);

  const addContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`
    };
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    if (user) {
      localStorage.setItem(`contacts_${user.id}`, JSON.stringify(updatedContacts));
    }
  };

  const updateContact = (id: string, contact: Omit<EmergencyContact, 'id'>) => {
    const updatedContacts = contacts.map(c => 
      c.id === id ? { ...contact, id } : c
    );
    setContacts(updatedContacts);
    if (user) {
      localStorage.setItem(`contacts_${user.id}`, JSON.stringify(updatedContacts));
    }
  };

  const deleteContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    if (user) {
      localStorage.setItem(`contacts_${user.id}`, JSON.stringify(updatedContacts));
    }
  };

  const triggerSOS = async (type: 'manual' | 'voice' | 'automatic', location: GeolocationPosition) => {
    if (!user) return;

    // Calculate risk level based on location (mock AI logic)
    const riskLevel = calculateRiskLevel(location);

    // Get address from coordinates (mock)
    const address = await getAddressFromCoords(location.coords.latitude, location.coords.longitude);

    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      userId: user.id,
      timestamp: new Date().toISOString(),
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address
      },
      type,
      riskLevel,
      contactsNotified: contacts.map(c => c.id),
      status: 'active'
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    localStorage.setItem(`alerts_${user.id}`, JSON.stringify(updatedAlerts));

    // Store globally for admin dashboard
    const globalAlerts = JSON.parse(localStorage.getItem('globalAlerts') || '[]');
    globalAlerts.push(newAlert);
    localStorage.setItem('globalAlerts', JSON.stringify(globalAlerts));

    // Simulate sending messages to contacts
    await simulateMessageSending(contacts, newAlert);
  };

  const resolveAlert = (id: string) => {
    const updatedAlerts = alerts.map(a => 
      a.id === id ? { ...a, status: 'resolved' as const } : a
    );
    setAlerts(updatedAlerts);
    if (user) {
      localStorage.setItem(`alerts_${user.id}`, JSON.stringify(updatedAlerts));
    }
  };

  return (
    <EmergencyContext.Provider value={{
      contacts,
      alerts,
      addContact,
      updateContact,
      deleteContact,
      triggerSOS,
      resolveAlert,
      currentLocation,
      locationError
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

// Mock AI risk detection
function calculateRiskLevel(location: GeolocationPosition): 'low' | 'medium' | 'high' {
  // Simple mock logic based on time and random factors
  const hour = new Date().getHours();
  const isNightTime = hour < 6 || hour > 22;
  
  // Simulate risk zones based on coordinates (mock data)
  const lat = location.coords.latitude;
  const lng = location.coords.longitude;
  
  // Mock high-risk zones
  const highRiskZones = [
    { lat: 40.7128, lng: -74.0060, radius: 0.1 }, // Example zone
  ];
  
  for (const zone of highRiskZones) {
    const distance = Math.sqrt(
      Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2)
    );
    if (distance < zone.radius) {
      return 'high';
    }
  }
  
  if (isNightTime) {
    return 'medium';
  }
  
  return 'low';
}

async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  // Mock geocoding
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

async function simulateMessageSending(contacts: EmergencyContact[], alert: Alert) {
  // Simulate API call to send messages
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Emergency alerts sent to:', contacts.length, 'contacts');
}
