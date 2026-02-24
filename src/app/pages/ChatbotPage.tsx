import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { detectIntent, generateResponse, ChatMessage } from '../utils/aiHelpers';

const QUICK_ACTIONS = [
  'First aid for bleeding',
  'CPR instructions',
  'Heart attack help',
  'Safety tips',
  'I need help',
];

export const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hello! I'm your Crisis Guardian AI assistant. I can help with emergency guidance, first aid instructions, safety tips, and more. How can I assist you today?",
      timestamp: new Date().toISOString(),
      urgency: 'low'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Detect intent and generate response
    const { intent, urgency } = detectIntent(messageText);
    const response = generateResponse(intent, urgency, messageText);
    
    const botMessage: ChatMessage = {
      id: `msg-${Date.now()}-bot`,
      role: 'bot',
      content: response,
      timestamp: new Date().toISOString(),
      intent,
      urgency
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };
  
  const handleQuickAction = (action: string) => {
    handleSend(action);
  };
  
  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-950 dark:to-green-950/30 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-full">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Emergency Assistant
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Powered by Crisis Guardian AI
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-500'
                }`}>
                  {message.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                
                {/* Message Content */}
                <div>
                  <Card className={`p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800'
                  }`}>
                    {message.urgency && message.urgency !== 'low' && message.role === 'bot' && (
                      <Badge className={`${getUrgencyColor(message.urgency)} mb-2`}>
                        {message.urgency === 'critical' && <AlertTriangle size={12} className="mr-1" />}
                        {message.urgency.toUpperCase()} PRIORITY
                      </Badge>
                    )}
                    
                    <div className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user' ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {message.content}
                    </div>
                  </Card>
                  
                  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500">
                  <Bot size={16} className="text-white" />
                </div>
                
                <Card className="p-3 bg-white dark:bg-slate-800">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-3 mb-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Quick Actions:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="whitespace-nowrap text-xs"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4">
        <Card className="p-3 bg-white dark:bg-slate-900 shadow-xl">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Send size={18} />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
              onClick={() => handleQuickAction('EMERGENCY - I need help now!')}
            >
              <Phone size={12} className="mr-1" />
              Emergency
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
