// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  isAdmin?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  email?: string;
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'sent' | 'delivered' | 'failed';
  contactsNotified: string[];
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
}

// Mock Auth Service
class AuthService {
  private storageKey = 'crisis_guardian_user';
  private tokenKey = 'crisis_guardian_token';

  login(email: string, password: string): Promise<{ user: User; token: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock users database
        const mockUsers: Record<string, { password: string; user: User }> = {
          'admin@crisis.com': {
            password: 'admin123',
            user: {
              id: 'admin-1',
              email: 'admin@crisis.com',
              name: 'Admin User',
              phone: '+1234567890',
              isAdmin: true,
            },
          },
          'user@test.com': {
            password: 'test123',
            user: {
              id: 'user-1',
              email: 'user@test.com',
              name: 'John Doe',
              phone: '+1987654321',
            },
          },
        };

        const mockUser = mockUsers[email];
        if (mockUser && mockUser.password === password) {
          const token = this.generateMockToken();
          localStorage.setItem(this.storageKey, JSON.stringify(mockUser.user));
          localStorage.setItem(this.tokenKey, token);
          resolve({ user: mockUser.user, token });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  }

  register(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<{ user: User; token: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          phone: data.phone,
        };
        const token = this.generateMockToken();
        localStorage.setItem(this.storageKey, JSON.stringify(user));
        localStorage.setItem(this.tokenKey, token);
        resolve({ user, token });
      }, 500);
    });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.storageKey);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private generateMockToken(): string {
    return `mock_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Emergency Contacts Service
class ContactsService {
  private storageKey = 'crisis_guardian_contacts';

  getContacts(): EmergencyContact[] {
    const contactsStr = localStorage.getItem(this.storageKey);
    return contactsStr ? JSON.parse(contactsStr) : this.getDefaultContacts();
  }

  addContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const contacts = this.getContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    contacts.push(newContact);
    localStorage.setItem(this.storageKey, JSON.stringify(contacts));
    return newContact;
  }

  updateContact(id: string, data: Partial<EmergencyContact>): EmergencyContact | null {
    const contacts = this.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...data };
      localStorage.setItem(this.storageKey, JSON.stringify(contacts));
      return contacts[index];
    }
    return null;
  }

  deleteContact(id: string): boolean {
    const contacts = this.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    if (filtered.length !== contacts.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  private getDefaultContacts(): EmergencyContact[] {
    return [
      {
        id: 'contact-1',
        name: 'Emergency Services',
        phone: '911',
        relation: 'Emergency',
      },
    ];
  }
}

// Alerts Service
class AlertsService {
  private storageKey = 'crisis_guardian_alerts';

  getAlerts(): Alert[] {
    const alertsStr = localStorage.getItem(this.storageKey);
    if (alertsStr) {
      const alerts = JSON.parse(alertsStr);
      return alerts.map((a: Alert) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
    }
    return [];
  }

  createAlert(location: Location, contactIds: string[]): Promise<Alert> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const alerts = this.getAlerts();
        const user = authService.getCurrentUser();
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          userId: user?.id || 'unknown',
          timestamp: new Date(),
          location: {
            lat: location.lat,
            lng: location.lng,
            address: location.address,
          },
          status: 'sent',
          contactsNotified: contactIds,
          riskLevel: location.riskLevel,
        };
        alerts.unshift(newAlert);
        localStorage.setItem(this.storageKey, JSON.stringify(alerts));
        resolve(newAlert);
      }, 1000);
    });
  }

  getAllAlerts(): Alert[] {
    // For admin dashboard
    return this.getAlerts();
  }
}

// Location Service with AI Risk Detection
class LocationService {
  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = await this.reverseGeocode(lat, lng);
          const riskData = this.analyzeLocationRisk(lat, lng, address);

          resolve({
            lat,
            lng,
            address,
            riskLevel: riskData.riskLevel,
            riskFactors: riskData.riskFactors,
          });
        },
        (error) => {
          // Return mock location if geolocation fails
          const mockLocation = this.getMockLocation();
          resolve(mockLocation);
        }
      );
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Mock reverse geocoding
    return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  private analyzeLocationRisk(
    lat: number,
    lng: number,
    address: string
  ): { riskLevel: 'Low' | 'Medium' | 'High'; riskFactors: string[] } {
    // AI-based risk detection algorithm
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Time-based risk (night time is riskier)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) {
      riskScore += 30;
      riskFactors.push('Late night/Early morning hours');
    } else if (hour >= 18 || hour <= 7) {
      riskScore += 15;
      riskFactors.push('Evening/Early morning');
    }

    // Mock crime data based on location patterns
    const crimeRisk = this.getCrimeRiskScore(lat, lng);
    riskScore += crimeRisk;
    if (crimeRisk > 20) {
      riskFactors.push('High crime area reported');
    } else if (crimeRisk > 10) {
      riskFactors.push('Moderate crime area');
    }

    // Population density (isolated areas are riskier)
    const densityScore = this.getPopulationDensityScore(lat, lng);
    riskScore += densityScore;
    if (densityScore > 20) {
      riskFactors.push('Isolated area with low population');
    }

    // Weather conditions
    const weatherRisk = this.getWeatherRisk();
    riskScore += weatherRisk;
    if (weatherRisk > 10) {
      riskFactors.push('Adverse weather conditions');
    }

    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (riskScore >= 60) {
      riskLevel = 'High';
    } else if (riskScore >= 30) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    if (riskFactors.length === 0) {
      riskFactors.push('Safe area conditions detected');
    }

    return { riskLevel, riskFactors };
  }

  private getCrimeRiskScore(lat: number, lng: number): number {
    // Mock ML model - using simple heuristics
    const hash = Math.abs(Math.sin(lat * lng) * 10000);
    return Math.floor(hash % 40);
  }

  private getPopulationDensityScore(lat: number, lng: number): number {
    const hash = Math.abs(Math.cos(lat + lng) * 10000);
    return Math.floor(hash % 30);
  }

  private getWeatherRisk(): number {
    // Mock weather API
    return Math.floor(Math.random() * 20);
  }

  private getMockLocation(): Location {
    return {
      lat: 40.7128,
      lng: -74.006,
      address: 'New York, NY (Mock Location)',
      riskLevel: 'Low',
      riskFactors: ['Using mock location data'],
    };
  }
}

// AI Chatbot Service
class ChatbotService {
  private conversationHistory: ChatMessage[] = [];

  sendMessage(text: string): Promise<ChatMessage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}-user`,
          text,
          sender: 'user',
          timestamp: new Date(),
        };
        this.conversationHistory.push(userMessage);

        const intent = this.detectIntent(text);
        const response = this.generateResponse(text, intent);

        const botMessage: ChatMessage = {
          id: `msg-${Date.now()}-bot`,
          text: response,
          sender: 'bot',
          timestamp: new Date(),
          intent,
        };
        this.conversationHistory.push(botMessage);

        resolve(botMessage);
      }, 500);
    });
  }

  private detectIntent(text: string): string {
    const lowerText = text.toLowerCase();

    // Panic detection
    const panicKeywords = ['help', 'emergency', 'danger', 'attack', 'scared', 'threat'];
    if (panicKeywords.some((keyword) => lowerText.includes(keyword))) {
      return 'panic';
    }

    // First aid
    const firstAidKeywords = ['bleeding', 'wound', 'injury', 'burn', 'fracture', 'choking', 'cpr'];
    if (firstAidKeywords.some((keyword) => lowerText.includes(keyword))) {
      return 'first_aid';
    }

    // Medical emergency
    const medicalKeywords = ['chest pain', 'heart attack', 'stroke', 'breathing', 'unconscious'];
    if (medicalKeywords.some((keyword) => lowerText.includes(keyword))) {
      return 'medical_emergency';
    }

    // Safety tips
    const safetyKeywords = ['safe', 'tips', 'advice', 'protect', 'prevention'];
    if (safetyKeywords.some((keyword) => lowerText.includes(keyword))) {
      return 'safety_tips';
    }

    // Greeting
    if (['hi', 'hello', 'hey'].some((keyword) => lowerText.includes(keyword))) {
      return 'greeting';
    }

    return 'general';
  }

  private generateResponse(text: string, intent: string): string {
    switch (intent) {
      case 'panic':
        return `🚨 I detect you may be in distress. Here's what to do:

1. Stay calm and breathe deeply
2. Move to a safe location if possible
3. Press the SOS button to alert your contacts
4. Call emergency services (911) immediately if you're in danger

Would you like me to guide you through specific safety steps?`;

      case 'first_aid':
        if (text.toLowerCase().includes('bleeding')) {
          return `🩹 For bleeding wounds:

1. Apply direct pressure with clean cloth
2. Elevate the injured area above heart level
3. Don't remove the cloth - add more if needed
4. Call 911 if bleeding is severe or doesn't stop
5. Keep the person warm and lying down

If bleeding is severe, press the SOS button now!`;
        } else if (text.toLowerCase().includes('burn')) {
          return `🔥 For burns:

1. Cool the burn under running water (10-20 min)
2. Remove jewelry/tight items before swelling
3. Cover with sterile, non-stick bandage
4. Don't use ice, butter, or ointments
5. Seek medical help for severe burns

For serious burns, call 911 immediately!`;
        }
        return `💊 First Aid guidance available for: bleeding, burns, fractures, choking, CPR. What do you need help with?`;

      case 'medical_emergency':
        return `🚑 MEDICAL EMERGENCY DETECTED

Immediate Actions:
1. Call 911 NOW if not already done
2. Stay with the person - don't leave them alone
3. Keep them comfortable and calm
4. Monitor breathing and consciousness
5. Use SOS button to alert your emergency contacts

For Heart Attack: Aspirin (if not allergic), sit them up
For Stroke: Note time symptoms started, don't give food/drink
For Choking: Heimlich maneuver

Do you need detailed instructions for a specific emergency?`;

      case 'safety_tips':
        return `🛡️ Safety Tips:

General Safety:
• Always share your location with trusted contacts
• Trust your instincts - if it feels unsafe, leave
• Stay in well-lit, populated areas at night
• Keep phone charged and emergency contacts saved

Using Crisis Guardian:
• Test your SOS button regularly
• Update emergency contacts
• Enable location services
• Familiarize yourself with the voice command: "SOS Alert"

Would you like specific safety tips for a situation?`;

      case 'greeting':
        return `👋 Hello! I'm your Crisis Guardian AI assistant. I'm here to help with:

• Emergency guidance and first aid
• Safety tips and advice
• Panic situation support
• Quick access to emergency services

How can I assist you today? Or just say "SOS Alert" if you need immediate help.`;

      default:
        return `I'm here to help with emergency situations, first aid, and safety guidance. 

You can ask me about:
• First aid procedures
• Emergency response
• Safety tips
• Medical emergencies

Or press the SOS button if you need immediate assistance. What would you like to know?`;
    }
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// Voice Assistant Service
class VoiceAssistantService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onSOSTrigger?: () => void;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

      // Detect SOS trigger words
      const sosKeywords = ['sos', 'emergency', 'help me', 'danger', 'alert'];
      if (sosKeywords.some((keyword) => transcript.includes(keyword))) {
        this.onSOSTrigger?.();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if we're supposed to be listening
        this.recognition?.start();
      }
    };
  }

  startListening(onSOSTrigger: () => void): boolean {
    if (!this.recognition) {
      return false;
    }

    this.onSOSTrigger = onSOSTrigger;
    this.isListening = true;
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      return false;
    }
  }

  stopListening(): void {
    this.isListening = false;
    this.recognition?.stop();
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }
}

// Export service instances
export const authService = new AuthService();
export const contactsService = new ContactsService();
export const alertsService = new AlertsService();
export const locationService = new LocationService();
export const chatbotService = new ChatbotService();
export const voiceAssistantService = new VoiceAssistantService();
