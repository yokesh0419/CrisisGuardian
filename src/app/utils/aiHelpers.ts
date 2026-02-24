export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  intent?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

// Intent detection using keyword matching (mock NLP)
export function detectIntent(message: string): { intent: string; urgency: 'low' | 'medium' | 'high' | 'critical' } {
  const lowercaseMessage = message.toLowerCase();
  
  // Critical emergency keywords
  const criticalKeywords = ['help', 'emergency', 'danger', 'attack', 'threat', 'violence', 'kidnap', 'assault'];
  const panicKeywords = ['panic', 'scared', 'terrified', 'afraid', 'fear'];
  const medicalKeywords = ['bleeding', 'injury', 'hurt', 'pain', 'unconscious', 'heart attack', 'stroke', 'overdose'];
  const firstAidKeywords = ['first aid', 'cpr', 'bandage', 'burn', 'wound', 'fracture', 'choking'];
  const safetyKeywords = ['safe', 'safety tips', 'precaution', 'prevent', 'protect'];
  
  if (criticalKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
    return { intent: 'emergency', urgency: 'critical' };
  }
  
  if (panicKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
    return { intent: 'panic', urgency: 'high' };
  }
  
  if (medicalKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
    return { intent: 'medical', urgency: 'high' };
  }
  
  if (firstAidKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
    return { intent: 'firstaid', urgency: 'medium' };
  }
  
  if (safetyKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
    return { intent: 'safety', urgency: 'low' };
  }
  
  return { intent: 'general', urgency: 'low' };
}

// Generate chatbot response based on intent
export function generateResponse(intent: string, urgency: string, userMessage: string): string {
  switch (intent) {
    case 'emergency':
      return `🚨 I detect this is an emergency situation. 

**IMMEDIATE ACTIONS:**
1. Call emergency services (911) NOW if you haven't already
2. Your SOS alert has been sent to your emergency contacts
3. Stay on the line with emergency services
4. If safe, move to a secure location

Would you like me to trigger your SOS alert automatically?`;

    case 'panic':
      return `I'm here to help you. Let's take a moment to breathe.

**CALMING STEPS:**
1. Take 3 deep breaths: Inhale for 4 seconds, hold for 4, exhale for 4
2. You are safe right now
3. Focus on 5 things you can see around you

If you're in immediate danger, say "EMERGENCY" and I'll alert your contacts.

How are you feeling now?`;

    case 'medical':
      if (userMessage.toLowerCase().includes('bleeding')) {
        return `**FOR SERIOUS BLEEDING:**

1. **Apply Pressure:** Use a clean cloth and press firmly on the wound
2. **Elevate:** Raise the injured area above heart level if possible
3. **Don't Remove Cloth:** Add more cloths on top if bleeding continues
4. **Call 911** if bleeding doesn't stop after 10 minutes

⚠️ Call emergency services immediately if:
- Bleeding is severe or spurting
- Wound is deep or large
- Object is embedded in wound

Do you need me to call emergency services?`;
      }
      
      if (userMessage.toLowerCase().includes('heart attack')) {
        return `**HEART ATTACK RESPONSE:**

1. **Call 911 IMMEDIATELY**
2. Have person sit down and rest
3. Loosen tight clothing
4. Give aspirin if available (chew it)
5. Begin CPR if person becomes unconscious

**Warning Signs:**
- Chest pain/pressure
- Shortness of breath
- Nausea or cold sweat

⚠️ TIME IS CRITICAL - Call emergency services now!`;
      }
      
      return `**MEDICAL EMERGENCY PROTOCOL:**

1. Assess the situation
2. Call 911 for serious injuries
3. Keep person calm and comfortable
4. Don't move them if spinal injury suspected

What specific medical issue are you dealing with? I can provide detailed first aid guidance.`;

    case 'firstaid':
      if (userMessage.toLowerCase().includes('burn')) {
        return `**BURN TREATMENT:**

1. **Cool the burn:** Run cool water over it for 10-20 minutes
2. **Remove jewelry/tight items** before swelling
3. **Cover loosely** with sterile gauze
4. **Don't apply:** ice, butter, or ointments
5. Take pain reliever if needed

⚠️ Seek medical help if:
- Burn is larger than 3 inches
- On face, hands, feet, or genitals
- Skin looks white or charred

Would you like more specific burn care instructions?`;
      }
      
      if (userMessage.toLowerCase().includes('cpr')) {
        return `**CPR INSTRUCTIONS (Adult):**

1. **Check responsiveness** - tap and shout
2. **Call 911** - or have someone else call
3. **Position:** Person on back on firm surface
4. **Hand placement:** Center of chest, between nipples
5. **Compressions:** 
   - Push hard and fast (2 inches deep)
   - Rate: 100-120 per minute
   - Count: 30 compressions
6. **Rescue breaths:** 2 breaths (if trained)
7. **Repeat** cycle until help arrives

🎵 Compress to the beat of "Stayin' Alive"

Continue until emergency services arrive or person responds.`;
      }
      
      return `**FIRST AID GUIDANCE AVAILABLE FOR:**

- Burns and scalds
- Cuts and wounds
- Fractures and sprains
- Choking
- CPR technique
- Poisoning
- Seizures

What specific first aid help do you need?`;

    case 'safety':
      return `**PERSONAL SAFETY TIPS:**

🛡️ **Prevention:**
- Stay in well-lit, populated areas
- Share your location with trusted contacts
- Trust your instincts
- Stay aware of surroundings

📱 **Technology:**
- Keep phone charged
- Use Crisis Guardian's GPS tracking
- Set up emergency contacts
- Enable voice-activated SOS

🚶 **When Walking:**
- Walk confidently
- Avoid distractions (phone)
- Vary your routes
- Have keys ready

Would you like specific safety tips for a particular situation?`;

    default:
      return `I'm your Crisis Guardian AI assistant. I can help with:

🚨 **Emergency Response** - Immediate danger assistance
🏥 **Medical Guidance** - First aid and injury care
😰 **Panic Support** - Calming techniques
🛡️ **Safety Tips** - Prevention and protection
📞 **Emergency Services** - Help contacting authorities

What can I help you with today?`;
  }
}

// Voice command recognition
export function processVoiceCommand(transcript: string): { isSOSCommand: boolean; confidence: number } {
  const sosKeywords = [
    'sos', 'help', 'emergency', 'danger', 'call for help', 
    'need help', 'alert', 'crisis', 'save me', '911'
  ];
  
  const lowercaseTranscript = transcript.toLowerCase();
  
  let matchCount = 0;
  let totalWords = transcript.split(' ').length;
  
  for (const keyword of sosKeywords) {
    if (lowercaseTranscript.includes(keyword)) {
      matchCount++;
    }
  }
  
  const confidence = Math.min((matchCount / sosKeywords.length) * 100, 100);
  const isSOSCommand = confidence > 20 || sosKeywords.some(k => lowercaseTranscript === k);
  
  return { isSOSCommand, confidence };
}

// Location risk assessment AI
export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  factors: string[];
  recommendations: string[];
}

export function assessLocationRisk(
  location: { latitude: number; longitude: number },
  timeOfDay: Date = new Date()
): RiskAssessment {
  const factors: string[] = [];
  let riskScore = 0;
  
  // Time-based risk
  const hour = timeOfDay.getHours();
  if (hour >= 22 || hour < 6) {
    riskScore += 25;
    factors.push('Late night hours (10 PM - 6 AM)');
  } else if (hour >= 6 && hour < 8) {
    riskScore += 10;
    factors.push('Early morning hours');
  }
  
  // Mock crime data (in production, this would query a real crime database)
  const mockHighCrimeZones = [
    { lat: 40.7128, lng: -74.0060, radius: 0.05, name: 'Downtown Area' },
    { lat: 34.0522, lng: -118.2437, radius: 0.05, name: 'Metro Zone' },
  ];
  
  for (const zone of mockHighCrimeZones) {
    const distance = Math.sqrt(
      Math.pow(location.latitude - zone.lat, 2) + 
      Math.pow(location.longitude - zone.lng, 2)
    );
    
    if (distance < zone.radius) {
      riskScore += 40;
      factors.push(`Located in ${zone.name} (elevated crime statistics)`);
    }
  }
  
  // Population density (mock)
  const isDenseArea = Math.abs(location.latitude) > 30 && Math.abs(location.longitude) > 70;
  if (!isDenseArea) {
    riskScore += 15;
    factors.push('Isolated area with low population density');
  }
  
  // Weather conditions (mock)
  const random = Math.random();
  if (random < 0.2) {
    riskScore += 10;
    factors.push('Poor weather conditions affecting visibility');
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore < 25) {
    riskLevel = 'low';
  } else if (riskScore < 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }
  
  // Generate recommendations
  const recommendations = generateSafetyRecommendations(riskLevel, factors);
  
  return {
    riskLevel,
    riskScore,
    factors: factors.length > 0 ? factors : ['No significant risk factors detected'],
    recommendations
  };
}

function generateSafetyRecommendations(riskLevel: string, factors: string[]): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel === 'high') {
    recommendations.push('🚨 Consider leaving this area if possible');
    recommendations.push('📱 Share your live location with emergency contacts');
    recommendations.push('🚶 Stay in well-lit, populated areas');
    recommendations.push('⚡ Keep Crisis Guardian SOS ready');
  } else if (riskLevel === 'medium') {
    recommendations.push('⚠️ Stay alert and aware of your surroundings');
    recommendations.push('👥 Avoid walking alone if possible');
    recommendations.push('🔦 Use well-lit routes');
  } else {
    recommendations.push('✅ Area appears relatively safe');
    recommendations.push('👀 Maintain general situational awareness');
  }
  
  // Time-specific recommendations
  if (factors.some(f => f.includes('night') || f.includes('morning'))) {
    recommendations.push('🌙 Avoid isolated areas during these hours');
    recommendations.push('🚗 Consider alternative transportation');
  }
  
  return recommendations;
}
