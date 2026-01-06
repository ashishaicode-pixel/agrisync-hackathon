import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'नमस्ते! I\'m your AgriSync AI assistant. I can help you with batch management, supply chain tracking, sustainable farming practices, and accessing premium markets. Ask me anything in English or Hindi! 🌱'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual Gemini API call)
      const aiResponse = await getAIResponse(userMessage);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again later or contact support for assistance.' 
      }]);
      setIsLoading(false);
    }
  };

  const getAIResponse = async (message) => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Fallback to local responses if API fails
      const responses = {
        'batch': 'To create a new batch, go to your dashboard and click "Create New Batch". Fill in your product details like name, type, quantity, and harvest date. The system will automatically generate a unique QR code for traceability.',
        'qr': 'QR codes in AgriSync contain a unique link to your product\'s verification page. Buyers can scan these codes to see the complete supply chain journey, trust score, and producer information.',
        'trust': 'Trust scores are calculated based on several factors: number of supply chain events logged, certifications attached, photo evidence provided, and producer verification status. Higher engagement leads to higher trust scores.',
        'certification': 'You can add certifications to your batches by going to the batch details page and uploading certificate documents. Supported types include organic, fair trade, and quality certifications.',
        'events': 'Supply chain events help track your product journey. Add events like processing, quality checks, packaging, and transport. Include photos and location data for better transparency.',
        'offline': 'AgriSync works offline! You can create batches and add events without internet. Data will sync automatically when connection is restored.',
        'help': 'I can help you with: Creating batches, Managing QR codes, Understanding trust scores, Adding certifications, Tracking supply chain events, Offline functionality, and General farming advice.'
      };

      const lowerMessage = message.toLowerCase();
      
      for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          return response;
        }
      }

      // Default farming advice responses
      const farmingAdvice = [
        'For sustainable farming, consider crop rotation to maintain soil health and reduce pest buildup. This practice can improve your product\'s marketability.',
        'Proper documentation of your farming practices increases buyer trust. Make sure to log all important events in your AgriSync batches.',
        'Consider obtaining organic or sustainable farming certifications to access premium markets and increase your product value.',
        'Regular soil testing helps optimize fertilizer use and can be documented as quality events in your supply chain tracking.',
        'Water conservation techniques not only help the environment but also create compelling stories for your product traceability.'
      ];

      return farmingAdvice[Math.floor(Math.random() * farmingAdvice.length)];
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-chat-container">
      {isOpen && (
        <div className="ai-chat-window slide-in">
          <div className="ai-chat-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={20} />
                <span>AgriSync AI Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.type === 'ai' ? 'ai-message' : 'user-message'}
              >
                {message.content}
              </div>
            ))}
            
            {isLoading && (
              <div className="ai-message">
                <div className="loading"></div>
                <span style={{ marginLeft: '0.5rem' }}>Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="ai-chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about AgriSync..."
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      
      <button
        className="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default AIChat;